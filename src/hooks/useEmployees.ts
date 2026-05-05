import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Employee } from '@/types/database'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const { isAdmin, isHR } = useAuth()

  const fetchEmployees = useCallback(async () => {
    if (!isAdmin && !isHR) return; // Only Admin/HR can fetch the list
    setLoading(true)
    try {
      // Step 1: Fetch employees and their departments
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*, departments(name)')
        .order('created_at', { ascending: false })

      if (empError) throw empError

      // Step 2: Fetch all user roles in one go to map them
      const { data: rolesData } = await supabase.from('user_roles').select('user_id, role')
      const roleMap = (rolesData || []).reduce((acc: any, curr) => {
        acc[curr.user_id] = curr.role
        return acc
      }, {})

      let mapped = (empData || []).map((e: any) => ({
        ...e,
        department: e.departments ? { name: e.departments.name } : undefined,
        role: roleMap[e.user_id] || 'employee'
      })) as (Employee & { role: string })[]

      // Filter: HR sees everyone except Admins
      if (isHR && !isAdmin) {
        mapped = mapped.filter(e => e.role !== 'admin')
      }

      setEmployees(mapped as any)
    } catch (err) {
      console.error('Error fetching employees:', err)
      if ((err as any)?.code !== '406') {
        addToast('error', 'Failed to load employees')
      }
    } finally {
      setLoading(false)
    }
  }, [addToast, isAdmin, isHR])

  const addEmployee = async (employee: Partial<Employee>) => {
    try {
      const { error } = await supabase.from('employees').insert(employee)
      if (error) throw error
      addToast('success', 'Employee added successfully')
      fetchEmployees()
    } catch (err) {
      console.error('Error adding employee:', err)
      addToast('error', 'Failed to add employee')
    }
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase.from('employees').update(updates).eq('id', id)
      if (error) throw error
      addToast('success', 'Employee updated successfully')
      fetchEmployees()
    } catch (err) {
      console.error('Error updating employee:', err)
      addToast('error', 'Failed to update employee')
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id)
      if (error) throw error
      addToast('success', 'Employee removed successfully')
      fetchEmployees()
    } catch (err) {
      console.error('Error deleting employee:', err)
      addToast('error', 'Failed to delete employee')
    }
  }

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
      
      if (error) throw error
      addToast('success', 'Role updated successfully')
    } catch (err) {
      console.error('Error updating role:', err)
      addToast('error', 'Failed to update user role')
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return { employees, loading, fetchEmployees, addEmployee, updateEmployee, deleteEmployee, updateRole }
}
