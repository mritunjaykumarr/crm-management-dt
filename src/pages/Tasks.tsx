import React, { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { useEmployees } from '@/hooks/useEmployees'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { Plus, GripVertical, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'border-t-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-blue-500' },
  { id: 'review', label: 'Review', color: 'border-t-amber-500' },
  { id: 'completed', label: 'Completed', color: 'border-t-emerald-500' },
]

export default function Tasks() {
  const { tasks, loading, addTask, updateTask } = useTasks()
  const { employees } = useEmployees()
  const { user, isAdmin, isHR } = useAuth()
  const [view, setView] = useState('board')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Task['priority'], due_date: '', assigned_to: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await addTask({ ...form })
    setShowDialog(false)
    setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tasks" description="Manage and track tasks">
        <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />New Task
        </button>
      </PageHeader>

      <Tabs tabs={[{ id: 'board', label: 'Board' }, { id: 'list', label: 'List' }]} activeTab={view} onTabChange={setView} />

      {view === 'board' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className={cn('rounded-xl border border-slate-200 bg-slate-50/50 border-t-4', col.color)}>
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 border border-slate-200">{colTasks.length}</span>
                </div>
                <div className="space-y-2 p-2 min-h-[200px]">
                  {colTasks.map(task => (
                    <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <GripVertical className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        <StatusBadge label={task.priority} variant={getStatusVariant(task.priority)} />
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 mt-2">{task.title}</h4>
                      {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {task.due_date ? formatDate(task.due_date) : 'No due date'}
                        </div>
                        {isAdmin || isHR ? (
                           <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                             <User className="h-3 w-3" />
                             {/* Note: This is simplified, real app would join employee name */}
                             <span>Assigned</span>
                           </div>
                        ) : null}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-50 flex gap-1">
                        {statusColumns.filter(s => s.id !== task.status).slice(0, 2).map(s => (
                          <button key={s.id} onClick={() => updateTask(task.id, { status: s.id as Task['status'] })} className="rounded px-2 py-1 text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                            → {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Task</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Due Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><p className="font-medium text-slate-900">{task.title}</p>{task.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{task.description}</p>}</td>
                  <td className="px-4 py-3"><StatusBadge label={task.priority} variant={getStatusVariant(task.priority)} /></td>
                  <td className="px-4 py-3"><StatusBadge label={task.status.replace('_', ' ')} variant={getStatusVariant(task.status)} /></td>
                  <td className="px-4 py-3 text-slate-600">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="Create Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 resize-none" /></div>
          
          {(isAdmin || isHR) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500">
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create Task</button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
