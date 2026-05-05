import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Attendance } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export function useAttendance() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, profile, isAdmin, isHR } = useAuth()
  const { addToast } = useToast()

  const today = new Date().toISOString().split('T')[0]

  const fetchAttendance = useCallback(async () => {
    // CRITICAL: If Auth hasn't loaded yet, keep loading = true and wait
    if (!user?.id || !profile?.id) {
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('attendance')
        .select('*, employees(first_name, last_name)')
        .order('date', { ascending: false })
        .order('check_in', { ascending: false })
        .limit(100)

      if (!isAdmin && !isHR) {
        // Broad search to find every possible session for this user
        query = query.or(`employee_id.eq.${profile.id},employee_id.eq.${user.id}`)
      }

      const { data, error } = await query
      if (error) throw error
      
      // Robust name mapping so it always says PRINCE
      const mapped = (data || []).map(rec => ({
        ...rec,
        employee: rec.employees || { 
          first_name: profile.full_name?.split(' ')[0] || 'My', 
          last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'Work' 
        }
      }))
      
      setRecords(mapped as any)

      // Find THE active session
      const { data: activeSession } = await supabase
        .from('attendance')
        .select('*')
        .or(`employee_id.eq.${profile.id},employee_id.eq.${user.id}`)
        .is('check_out', null)
        .order('check_in', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      setTodayRecord(activeSession as Attendance | null)
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.id, isAdmin, isHR])

  const checkIn = async () => {
    if (!profile?.id) {
      addToast('error', 'Profile not ready. Please try again in a moment.')
      return
    }

    try {
      const { data: active } = await supabase.from('attendance')
        .select('id')
        .or(`employee_id.eq.${profile.id},employee_id.eq.${user?.id}`)
        .is('check_out', null)
        .maybeSingle();

      if (active) {
        addToast('warning', 'Active session found. Please check out first.')
        fetchAttendance()
        return
      }

      const now = new Date().toISOString()
      const { error } = await supabase.from('attendance').insert({
        employee_id: profile.id,
        date: today,
        check_in: now,
        status: 'present',
      })

      if (error) throw error
      addToast('success', 'Checked in successfully')
      fetchAttendance()
    } catch (err) {
      addToast('error', 'Failed to check in')
    }
  }

  const checkOut = async (recordId?: string) => {
    const idToClose = recordId || todayRecord?.id
    if (!idToClose) return

    try {
      const { data: record } = await supabase.from('attendance').select('check_in').eq('id', idToClose).single()
      if (!record) return

      const now = new Date()
      const checkInTime = new Date(record.check_in!)
      const hoursWorked = Math.max(0, (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60))

      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          hours_worked: Math.round(hoursWorked * 100) / 100,
        })
        .eq('id', idToClose)

      if (error) throw error
      addToast('success', 'Checked out successfully.')
      fetchAttendance()
    } catch (err) {
      addToast('error', 'Failed to check out')
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  return { records, todayRecord, loading, fetchAttendance, checkIn, checkOut }
}
