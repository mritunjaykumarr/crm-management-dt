import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaveRequest, LeaveBalance, LeaveType } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export function useLeave() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, isAdmin, isHR } = useAuth()
  const { addToast } = useToast()

  const fetchLeaveTypes = useCallback(async () => {
    const { data } = await supabase.from('leave_types').select('*').order('name')
    setLeaveTypes((data || []) as LeaveType[])
  }, [])

  const fetchRequests = useCallback(async () => {
    if (!profile?.id) return;
    try {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          leave_types(name, color),
          employees(first_name, last_name, user_id)
        `)
        .order('created_at', { ascending: false })

      if (!isAdmin && !isHR) {
        // STRICT PRIVACY: Employees can ONLY see their own data
        query = query.eq('employee_id', profile.id)
      } else {
        // Admins can see everything, but we filter out the NULLs for cleaner UI
        query = query.not('employees', 'is', null)
      }

      const { data, error } = await query
      if (error) throw error

      // 🛡️ Final Name Recovery: If names are missing, search ALL tables by BOTH ID formats
      const requestsWithNames = await Promise.all((data || []).map(async (req) => {
        // If we already have the joined employee data, we are good
        if (req.employees?.first_name) {
          return { ...req, employee: req.employees };
        }
        
        const searchId = req.employee_id;
        if (!searchId) return req;

        // Try searching by ID in all 3 tables
        for (const table of ['administrators', 'hr_managers', 'employees']) {
          const { data: profile } = await supabase
            .from(table)
            .select('first_name, last_name, avatar_url')
            .or(`id.eq.${searchId},user_id.eq.${searchId}`)
            .maybeSingle();
          
          if (profile?.first_name) {
            return { ...req, employee: profile };
          }
        }
        
        return req;
      }));

      setRequests(requestsWithNames as LeaveRequest[])
    } catch (err) {
      console.error('Error fetching leave requests:', err)
      if ((err as any)?.code !== '406' && (err as any)?.message !== 'undefined') {
        addToast('error', 'Failed to load leave requests')
      }
    }
  }, [profile?.id, isAdmin, isHR, addToast])

  const fetchBalances = useCallback(async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*, leave_types(name, color)')
        .eq('employee_id', profile.id)
        .eq('year', new Date().getFullYear())

      if (error) throw error
      setBalances((data || []) as LeaveBalance[])
    } catch (err) {
      console.error('Error fetching leave balances:', err)
    }
  }, [profile?.id])

  const submitRequest = async (request: {
    leave_type_id: string
    start_date: string
    end_date: string
    reason: string
  }) => {
    if (!user) return
    try {
      const { data: emp } = await supabase.from('employees').select('id').eq('user_id', user.id).maybeSingle();
      if (!emp) throw new Error("Employee record not found");

      const start = new Date(request.start_date)
      const end = new Date(request.end_date)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      const { error } = await supabase.from('leave_requests').insert({
        employee_id: emp.id,
        leave_type_id: request.leave_type_id,
        start_date: request.start_date,
        end_date: request.end_date,
        days,
        reason: request.reason,
        status: 'pending',
      })

      if (error) throw error
      addToast('success', 'Leave request submitted')
      fetchRequests()
    } catch (err) {
      console.error('Error submitting leave request:', err)
      addToast('error', 'Failed to submit leave request')
    }
  }

  const approveRequest = async (id: string, notes?: string) => {
    if (!user) return
    try {
      const { data: emp } = await supabase.from('employees').select('id').eq('user_id', user.id).maybeSingle();
      if (!emp) throw new Error("Employee record not found");

      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved', approved_by: emp.id, admin_notes: notes })
        .eq('id', id)
      if (error) throw error
      addToast('success', 'Leave request approved')
      fetchRequests()
    } catch (err) {
      console.error('Error approving request:', err)
      addToast('error', 'Failed to approve request')
    }
  }

  const rejectRequest = async (id: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'rejected', admin_notes: notes })
        .eq('id', id)
      if (error) throw error
      addToast('success', 'Leave request rejected')
      fetchRequests()
    } catch (err) {
      console.error('Error rejecting request:', err)
      addToast('error', 'Failed to reject request')
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchLeaveTypes(), fetchRequests(), fetchBalances()])
      .finally(() => setLoading(false))
  }, [fetchLeaveTypes, fetchRequests, fetchBalances])

  return {
    requests, balances, leaveTypes, loading,
    fetchRequests, submitRequest, approveRequest, rejectRequest,
  }
}
