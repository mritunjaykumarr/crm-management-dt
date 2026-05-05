import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Department } from '@/types/database'
import { useToast } from '@/contexts/ToastContext'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setDepartments(data || [])
    } catch (err) {
      console.error('Error fetching departments:', err)
      addToast('error', 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const addDepartment = async (dept: Partial<Department>) => {
    try {
      const { error } = await supabase.from('departments').insert(dept)
      if (error) throw error
      addToast('success', 'Department created successfully')
      fetchDepartments()
    } catch (err) {
      console.error('Error adding department:', err)
      addToast('error', 'Failed to create department')
    }
  }

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const { error } = await supabase.from('departments').update(updates).eq('id', id)
      if (error) throw error
      addToast('success', 'Department updated successfully')
      fetchDepartments()
    } catch (err) {
      console.error('Error updating department:', err)
      addToast('error', 'Failed to update department')
    }
  }

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id)
      if (error) throw error
      addToast('success', 'Department deleted successfully')
      fetchDepartments()
    } catch (err) {
      console.error('Error deleting department:', err)
      addToast('error', 'Failed to delete department')
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return { departments, loading, fetchDepartments, addDepartment, updateDepartment, deleteDepartment }
}
