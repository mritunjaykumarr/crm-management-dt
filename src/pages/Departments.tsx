import React, { useState } from 'react'
import { useDepartments } from '@/hooks/useDepartments'
import { PageHeader } from '@/components/ui/page-header'
import { Dialog } from '@/components/ui/dialog'
import { Plus, Building2, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react'

export default function Departments() {
  const { departments, loading, addDepartment, updateDepartment, deleteDepartment } = useDepartments()
  const [showDialog, setShowDialog] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await updateDepartment(editId, form)
    } else {
      await addDepartment(form)
    }
    setShowDialog(false)
    setEditId(null)
    setForm({ name: '', description: '' })
  }

  const handleEdit = (dept: { id: string; name: string; description?: string }) => {
    setEditId(dept.id)
    setForm({ name: dept.name, description: dept.description || '' })
    setShowDialog(true)
    setOpenMenu(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDepartment(id)
    }
    setOpenMenu(null)
  }

  const colors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-purple-500 to-purple-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Departments" description="Manage organizational departments">
        <button
          onClick={() => { setEditId(null); setForm({ name: '', description: '' }); setShowDialog(true) }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No departments yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create your first department to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <div
              key={dept.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[i % colors.length]} text-white shadow-sm`}>
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === dept.id ? null : dept.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === dept.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-10 animate-scale-in">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{dept.name}</h3>
              {dept.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{dept.description}</p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Users className="h-3.5 w-3.5" />
                <span>{dept.employee_count || 0} employees</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={showDialog}
        onClose={() => { setShowDialog(false); setEditId(null) }}
        title={editId ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowDialog(false); setEditId(null) }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
