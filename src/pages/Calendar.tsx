import React, { useState } from 'react'
import { useCalendar } from '@/hooks/useCalendar'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/page-header'
import { Dialog } from '@/components/ui/dialog'
import { Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Calendar() {
  const { events, holidays, loading, addEvent } = useCalendar()
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '', type: 'event' as const })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr)
    const dayHolidays = holidays.filter(h => h.date === dateStr)
    return { events: dayEvents, holidays: dayHolidays }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await addEvent({ ...form, created_by: user.id })
    setShowDialog(false)
    setForm({ title: '', description: '', start_date: '', end_date: '', type: 'event' })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Calendar" description="Events and company holidays">
        <button onClick={() => setShowDialog(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />Add Event
        </button>
      </PageHeader>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="rounded-lg p-2 hover:bg-slate-100 transition-colors"><ChevronLeft className="h-5 w-5 text-slate-600" /></button>
          <h3 className="text-lg font-semibold text-slate-900">{monthName}</h3>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="rounded-lg p-2 hover:bg-slate-100 transition-colors"><ChevronRight className="h-5 w-5 text-slate-600" /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-slate-50 bg-slate-25" />

            const { events: dayEvts, holidays: dayHols } = getEventsForDay(day)
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

            return (
              <div key={day} className={cn('min-h-[80px] border-b border-r border-slate-50 p-1.5 transition-colors hover:bg-blue-50/50', isToday && 'bg-blue-50')}>
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium', isToday ? 'bg-blue-600 text-white' : 'text-slate-700')}>
                  {day}
                </div>
                <div className="mt-1 space-y-0.5">
                  {dayHols.map(h => (
                    <div key={h.id} className="flex items-center gap-1 rounded px-1 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-medium truncate">
                      <Star className="h-2.5 w-2.5 flex-shrink-0" />{h.name}
                    </div>
                  ))}
                  {dayEvts.slice(0, 2).map(evt => (
                    <div key={evt.id} className="rounded px-1 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-medium truncate">{evt.title}</div>
                  ))}
                  {dayEvts.length > 2 && <p className="text-[10px] text-slate-400 px-1">+{dayEvts.length - 2} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming holidays */}
      {holidays.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming Holidays</h3>
          <div className="space-y-2">
            {holidays.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><Star className="h-4 w-4" /></div>
                  <div><p className="text-sm font-medium text-slate-700">{h.name}</p><p className="text-xs text-slate-400">{h.type}</p></div>
                </div>
                <span className="text-sm text-slate-500">{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="Add Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Title</label><input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Start</label><input type="date" required value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">End</label><input type="date" required value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowDialog(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create</button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
