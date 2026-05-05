import React, { useState } from 'react'
import { useLeave } from '@/hooks/useLeave'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge'
import { Tabs } from '@/components/ui/tabs'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { Plus, CalendarOff, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

export default function Leave() {
  const { requests, balances, leaveTypes, loading, submitRequest, approveRequest, rejectRequest } = useLeave()
  const { isAdmin } = useAuth()
  
  const [activeTab, setActiveTab] = useState('requests')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' })
  const [notesMap, setNotesMap] = useState<Record<string, string>>({})

  const pendingRequests = requests.filter(r => r.status === 'pending')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitRequest(form)
    setShowDialog(false)
    setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' })
  }

  const handleQuickAction = async (id: string, type: 'approve' | 'reject') => {
    const notes = notesMap[id] || ''
    if (type === 'approve') {
      await approveRequest(id, notes)
    } else {
      await rejectRequest(id, notes)
    }
    setNotesMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const tabs = [
    { id: 'requests', label: 'My Requests', count: requests.length },
    ...(isAdmin ? [{ id: 'approvals', label: 'Approvals', count: pendingRequests.length }] : []),
    { id: 'balances', label: 'Balances' },
  ]

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Leave Management" description="Request and manage leaves">
        <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />Apply Leave
        </button>
      </PageHeader>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center py-12"><CalendarOff className="h-10 w-10 text-slate-300 mb-3" /><p className="text-sm text-slate-500">No leave requests yet</p></div>
          ) : requests.map(req => (
            <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{(req.leave_type as any)?.name || 'Leave'}</p>
                <p className="text-sm text-slate-500 mt-0.5">{formatDate(req.start_date)} – {formatDate(req.end_date)} · {req.days} day(s)</p>
                <p className="text-xs text-slate-400 mt-1 italic">"{req.reason}"</p>
                {req.admin_notes && (
                  <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5" />
                    <span><b>Director's Feedback:</b> {req.admin_notes}</span>
                  </div>
                )}
              </div>
              <StatusBadge label={req.status} variant={getStatusVariant(req.status)} />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'approvals' && isAdmin && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center py-12"><CheckCircle className="h-10 w-10 text-slate-300 mb-3" /><p className="text-sm text-slate-500 font-bold">All caught up! No pending approvals.</p></div>
          ) : pendingRequests.map(req => (
            <div key={req.id} className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-md hover:shadow-lg transition-all">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    { (req.employee as any)?.avatar_url ? (
                      <img 
                        src={(req.employee as any).avatar_url} 
                        alt="Profile" 
                        className="h-14 w-14 rounded-2xl object-cover shadow-lg border-2 border-white ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-xl">
                        {(req.employee as any)?.first_name?.[0]}{(req.employee as any)?.last_name?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {(req.employee as any)?.first_name ? 
                          `${(req.employee as any).first_name} ${(req.employee as any).last_name}` : 
                          'Staff Member'}
                      </p>
                      <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] uppercase tracking-wider">{(req.leave_type as any)?.name}</span>
                        <span>{formatDate(req.start_date)} – {formatDate(req.end_date)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-900/5 p-4 rounded-2xl border-2 border-slate-200">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Employee Reason</p>
                    <p className="text-sm text-slate-900 font-bold leading-relaxed italic">"{req.reason}"</p>
                  </div>
                </div>

                <div className="w-full md:w-80 flex flex-col gap-4">
                  <div className="relative">
                    <textarea 
                      value={notesMap[req.id] || ''} 
                      onChange={e => setNotesMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                      placeholder="Add a decision note here..."
                      className="w-full h-24 rounded-2xl border-2 border-slate-300 p-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleQuickAction(req.id, 'reject')} 
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white text-red-600 py-3.5 text-xs font-black hover:bg-red-50 transition-all border-2 border-red-500 shadow-sm"
                    >
                      <XCircle className="h-4 w-4" /> REJECT
                    </button>
                    <button 
                      onClick={() => handleQuickAction(req.id, 'approve')} 
                      className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white py-3.5 text-xs font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30"
                    >
                      <CheckCircle className="h-4 w-4" /> APPROVE REQUEST
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Used</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Remaining</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map(b => (
                <tr key={b.id}><td className="px-4 py-3 font-medium">{(b.leave_type as any)?.name}</td><td className="px-4 py-3">{b.total_days}</td><td className="px-4 py-3">{b.used_days}</td><td className="px-4 py-3 font-semibold text-blue-600">{b.remaining_days}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select required value={form.leave_type_id} onChange={e => setForm(f => ({ ...f, leave_type_id: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500">
              <option value="">Select type</option>
              {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label><input type="date" required value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">End Date</label><input type="date" required value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Reason</label><textarea required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Submit</button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
