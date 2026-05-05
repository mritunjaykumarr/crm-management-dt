import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, isAdmin, isHR } = useAuth()
  const { addToast } = useToast()

  const fetchTasks = useCallback(async () => {
    // STRICT GUARD: Do not even try to fetch if we don't have a valid ID
    if (!profile?.id || !user?.id || profile.id === 'undefined') {
      return;
    }
    setLoading(true)
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isAdmin && !isHR) {
        // STRICT PRIVACY: Only show tasks assigned to THIS specific employee
        query = query.or(`assigned_to.eq.${profile.id},assigned_to.eq.${user.id}`)
      }

      const { data, error } = await query
      if (error) throw error
      setTasks((data || []) as Task[])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      if ((err as any)?.code !== '406') {
        addToast('error', 'Failed to load tasks')
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile?.id, isAdmin, isHR, addToast])

  const addTask = async (task: Partial<Task>) => {
    if (!user) return
    try {
      const { data: currentEmp } = await supabase.from('employees').select('id').eq('user_id', user.id).maybeSingle();
      if (!currentEmp) throw new Error("Current employee record not found");

      // If assigned_to is missing or is a user_id, map it
      let assignedToId = task.assigned_to;
      if (!assignedToId || assignedToId === user.id) {
        assignedToId = currentEmp.id;
      }

      const { error } = await supabase.from('tasks').insert({
        ...task,
        assigned_to: assignedToId,
        assigned_by: currentEmp.id,
        status: task.status || 'todo',
      })
      if (error) throw error
      addToast('success', 'Task created successfully')
      fetchTasks()
    } catch (err) {
      console.error('Error adding task:', err)
      addToast('error', 'Failed to create task')
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const payload: Record<string, unknown> = { ...updates }
      if (updates.status === 'completed') {
        payload.completed_at = new Date().toISOString()
      }
      const { error } = await supabase.from('tasks').update(payload).eq('id', id)
      if (error) throw error
      addToast('success', 'Task updated')
      fetchTasks()
    } catch (err) {
      console.error('Error updating task:', err)
      addToast('error', 'Failed to update task')
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      addToast('success', 'Task deleted')
      fetchTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
      addToast('error', 'Failed to delete task')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, fetchTasks, addTask, updateTask, deleteTask }
}
