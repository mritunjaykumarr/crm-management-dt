import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { StatCard } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge'
import { formatDate } from '@/lib/utils'
import {
  Users, Clock, CalendarOff, ListTodo, Building2, CalendarDays,
  TrendingUp, CheckCircle2, AlertCircle, DollarSign, Briefcase, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import type { DashboardStats } from '@/types/database'
import { cn } from '@/lib/utils'

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']

const mockAttendanceData = [
  { day: 'Mon', present: 45, absent: 5 },
  { day: 'Tue', present: 48, absent: 2 },
  { day: 'Wed', present: 42, absent: 8 },
  { day: 'Thu', present: 47, absent: 3 },
  { day: 'Fri', present: 44, absent: 6 },
]

export default function Dashboard() {
  const { profile, role, isAdmin, isHR } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeTasks: 0,
    departments: 0,
    upcomingHolidays: 0,
  })
  const [recentLeaves, setRecentLeaves] = useState<any[]>([])
  const [recentTasks, setRecentTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: emp } = await supabase.from('employees').select('id').eq('user_id', profile?.id).maybeSingle();
        
        const [
          { count: empCount },
          { count: attCount },
          { count: leaveCount },
          { count: taskCount },
          { count: deptCount },
          { count: holidayCount },
          { count: personalTaskCount },
          { count: personalLeaveCount },
        ] = await Promise.all([
          supabase.from('employees').select('*', { count: 'exact', head: true }),
          supabase.from('attendance').select('*', { count: 'exact', head: true })
            .eq('date', new Date().toISOString().split('T')[0]).eq('status', 'present'),
          supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
          supabase.from('holidays').select('*', { count: 'exact', head: true })
            .gte('date', new Date().toISOString().split('T')[0]),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', emp?.id).neq('status', 'completed'),
          supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('employee_id', emp?.id).eq('status', 'pending'),
        ])

        setStats({
          totalEmployees: empCount || 0,
          presentToday: attCount || 0,
          pendingLeaves: (isAdmin || isHR) ? (leaveCount || 0) : (personalLeaveCount || 0),
          activeTasks: (isAdmin || isHR) ? (taskCount || 0) : (personalTaskCount || 0),
          departments: deptCount || 0,
          upcomingHolidays: holidayCount || 0,
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      }
    }

    const fetchRecent = async () => {
      try {
        const { data: emp } = await supabase.from('employees').select('id').eq('user_id', profile?.id).maybeSingle();

        let leavesQuery = supabase
          .from('leave_requests')
          .select('*, employees(first_name, last_name), leave_types(name)')
          .order('created_at', { ascending: false })
          .limit(5)

        let tasksQuery = supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (!isAdmin && !isHR && emp) {
          leavesQuery = leavesQuery.eq('employee_id', emp.id)
          tasksQuery = tasksQuery.eq('assigned_to', emp.id)
        }

        const [{ data: leaves }, { data: tasks }] = await Promise.all([leavesQuery, tasksQuery])

        setRecentLeaves(leaves || [])
        setRecentTasks(tasks || [])
      } catch (err) {
        console.error('Error fetching recent data:', err)
      }
    }

    if (profile?.id) {
      fetchStats()
      fetchRecent()
    }
  }, [profile?.id, isAdmin, isHR])

  // --- RENDER ADMIN DASHBOARD ---
  if (isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-2 tracking-tight">Director Control Center</h1>
              <p className="text-amber-100 font-medium opacity-90">Good evening, {profile?.full_name?.split(' ')[0]}. Here is your company's vital signs.</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-200">System Health</p>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                  <span className="text-sm font-bold">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Workforce" value={stats.totalEmployees} icon={<Users />} iconColor="bg-amber-100 text-amber-600" />
          <StatCard title="Revenue (MTD)" value="$124,500" icon={<DollarSign />} iconColor="bg-emerald-100 text-emerald-600" />
          <StatCard title="Project ROI" value="3.2x" icon={<Briefcase />} iconColor="bg-blue-100 text-blue-600" />
          <StatCard title="Growth" value="+14%" icon={<TrendingUp />} iconColor="bg-purple-100 text-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Company Performance Index</h3>
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockAttendanceData}>
                  <defs>
                    <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="present" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorAdmin)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
             <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                   <div className="flex items-center gap-3"><Users className="h-5 w-5" /><span className="font-semibold text-sm">Manage Roles</span></div>
                   <Zap className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                   <div className="flex items-center gap-3"><DollarSign className="h-5 w-5" /><span className="font-semibold text-sm">Financials</span></div>
                   <Zap className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER HR DASHBOARD ---
  if (isHR) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">HR Management Portal</h1>
              <p className="text-slate-500 font-medium">Overseeing {stats.totalEmployees} employees across {stats.departments} departments.</p>
           </div>
           <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl font-bold text-sm">
              <Users className="h-4 w-4" /> Personnel Active
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Attendance Today" value={stats.presentToday} icon={<Clock />} iconColor="bg-purple-100 text-purple-600" />
          <StatCard title="Pending Approvals" value={stats.pendingLeaves} icon={<CalendarOff />} iconColor="bg-indigo-100 text-indigo-600" />
          <StatCard title="New Hires (MTD)" value="5" icon={<Users />} iconColor="bg-pink-100 text-pink-600" />
          <StatCard title="Active Tasks" value={stats.activeTasks} icon={<ListTodo />} iconColor="bg-blue-100 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Leave Requests</h3>
              <div className="space-y-4">
                 {recentLeaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                             {leave.employees?.first_name[0]}{leave.employees?.last_name[0]}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{leave.employees?.first_name} {leave.employees?.last_name}</p>
                             <p className="text-[10px] text-slate-500 font-medium">{leave.leave_types?.name} · {formatDate(leave.start_date)}</p>
                          </div>
                       </div>
                       <StatusBadge label={leave.status} variant={getStatusVariant(leave.status)} />
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Workforce Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                 <BarChart data={mockAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="present" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    )
  }

  // --- RENDER EMPLOYEE DASHBOARD ---
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Workspace</h1>
          <p className="text-slate-500 font-medium">Welcome back, {profile?.full_name}. Have a productive day!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Active Tasks" value={stats.activeTasks} icon={<ListTodo />} iconColor="bg-blue-100 text-blue-600" />
        <StatCard title="Leave Balance" value="12 Days" icon={<CalendarOff />} iconColor="bg-rose-100 text-rose-600" />
        <StatCard title="Today's Status" value="ON SHIFT" icon={<Clock />} iconColor="bg-emerald-100 text-emerald-600" />
        <StatCard title="Holidays" value={stats.upcomingHolidays} icon={<CalendarDays />} iconColor="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">My Current Tasks</h3>
          <div className="space-y-3">
             {recentTasks.map(task => (
                <div key={task.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer">
                   <div className="flex items-center justify-between mb-2">
                      <StatusBadge label={task.priority} variant={getStatusVariant(task.priority)} />
                      <span className="text-[10px] font-bold text-slate-400">{formatDate(task.due_date)}</span>
                   </div>
                   <p className="text-sm font-bold text-slate-900">{task.title}</p>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                </div>
             ))}
          </div>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
           <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6">Attendance Trend</h3>
           <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={3} fill="#3b82f620" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
