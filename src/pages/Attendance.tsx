import React from 'react'
import { useAttendance } from '@/hooks/useAttendance'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge'
import { formatDate, formatTime } from '@/lib/utils'
import { Clock, LogIn, LogOut, Timer, Calendar, History, Coffee, Users, BarChart } from 'lucide-react'
import type { Attendance } from '@/types/database'

export default function AttendancePage() {
  const { records, todayRecord, loading, checkIn, checkOut } = useAttendance()
  const { isAdmin, isHR } = useAuth()
  
  // Robust check for active session
  const isCheckedIn = !!todayRecord && !!todayRecord.check_in && !todayRecord.check_out
  const isCheckedOut = !!todayRecord && !!todayRecord.check_out

  // Admin/HR Summary Stats
  const teamTotalHours = records.reduce((acc, curr) => acc + (curr.hours_worked || 0), 0)
  const activeMembers = records.filter(r => r.date === new Date().toISOString().split('T')[0] && !r.check_out).length

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader title="Attendance Portal" description="Track daily attendance and manage team working hours." />

      {/* Hero Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-2xl transition-all duration-500 ${isCheckedIn ? 'bg-emerald-500 shadow-emerald-500/20 rotate-12' : 'bg-blue-600 shadow-blue-500/20'}`}>
              <Clock className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                {isCheckedIn ? 'Session Active' : isCheckedOut ? 'Day Completed' : 'Ready to Start?'}
              </h3>
              <p className="text-slate-400 font-medium flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" /> {formatDate(new Date())}
              </p>
              {isCheckedIn && (
                <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm font-bold animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live Since: {formatTime(todayRecord.check_in!)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {isCheckedIn ? (
              <button 
                onClick={() => checkOut()} 
                className="group flex items-center justify-center gap-3 rounded-2xl bg-red-500 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-95 shadow-xl shadow-red-500/20"
              >
                <LogOut className="h-5 w-5" /> 
                Check Out Now
              </button>
            ) : (
              <button 
                onClick={() => checkIn()} 
                className="group flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-blue-50 active:scale-95 shadow-xl"
              >
                <LogIn className="h-5 w-5 text-blue-600" /> 
                Check In Now
              </button>
            )}
            
            {isCheckedOut && !isCheckedIn && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-sm font-bold text-white border border-white/10 backdrop-blur-md">
                <Timer className="h-5 w-5 text-emerald-400" />
                Shift Ended · {todayRecord?.hours_worked?.toFixed(1)}h Total
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin/HR Oversight Dashboard */}
      {(isAdmin || isHR) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Active Now</p>
              <p className="text-2xl font-black text-slate-900">{activeMembers} <span className="text-sm font-bold text-slate-400">Members</span></p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <BarChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Team Hours</p>
              <p className="text-2xl font-black text-slate-900">{teamTotalHours.toFixed(1)} <span className="text-sm font-bold text-slate-400">Hours Logged</span></p>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <History className="h-5 w-5 text-blue-600" /> 
            {isAdmin || isHR ? 'Team Activity Log' : 'My Attendance History'}
          </h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live View</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-400 tracking-wide">Syncing Data...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <Coffee className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No sessions recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((rec) => (
              <div key={rec.id} className="glass-card group relative overflow-hidden rounded-3xl p-6 hover:translate-y-[-4px] transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(rec.date)}</p>
                    <h4 className="text-sm font-bold text-slate-900">
                      {(rec.employee as any)?.first_name ? `${(rec.employee as any).first_name} ${(rec.employee as any).last_name}` : 'Staff Member'}
                    </h4>
                  </div>
                  <StatusBadge label={rec.status} variant={getStatusVariant(rec.status)} />
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Check In</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <LogIn className="h-3.5 w-3.5 text-emerald-500" /> {rec.check_in ? formatTime(rec.check_in) : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Check Out</p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <LogOut className="h-3.5 w-3.5 text-red-400" /> {rec.check_out ? formatTime(rec.check_out) : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Timer className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Session Time</p>
                      <p className="text-sm font-black text-slate-900">
                        {rec.hours_worked ? `${rec.hours_worked.toFixed(1)} Hours` : 'In Progress...'}
                      </p>
                    </div>
                  </div>
                  {!rec.check_out ? (
                    <button 
                      onClick={() => checkOut(rec.id)}
                      className="h-8 px-3 rounded-xl bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/20"
                    >
                      <LogOut className="h-3 w-3" /> Check Out
                    </button>
                  ) : (
                    rec.hours_worked && rec.hours_worked >= 8 && (
                      <div className="h-6 px-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center">Full Day ✓</div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
