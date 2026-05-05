import React, { useState, useEffect } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge'
import { formatDate, getInitials } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  ArrowUp, 
  Eye, 
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  X,
  Shield,
  Briefcase,
  ExternalLink
} from 'lucide-react'

export default function Employees() {
  const { employees, loading } = useEmployees()
  const { isAdmin, isHR } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  // Filter out duplicates
  const uniqueEmployees = Array.from(new Map(employees.map(emp => [emp.user_id, emp])).values())

  const filteredEmployees = uniqueEmployees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <PageHeader title="Employee Directory" description="Manage your team members and their access levels.">
        {(isAdmin || isHR) && (
          <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            <UserPlus className="h-4 w-4" /> Add Employee
          </button>
        )}
      </PageHeader>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search team members..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Position</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading directory...</td></tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getInitials(`${emp.first_name} ${emp.last_name}`)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{emp.position || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{(emp as any).departments?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(emp.hire_date)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100">
                      <Eye className="h-3.5 w-3.5" /> See Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Profile Panel */}
      {selectedEmployee && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setSelectedEmployee(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] animate-slide-left p-0 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Employee Profile</h3>
              <button onClick={() => setSelectedEmployee(null)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Header Info */}
              <div className="text-center space-y-4">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  {getInitials(`${selectedEmployee.first_name} ${selectedEmployee.last_name}`)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                  <p className="text-sm font-bold text-blue-600">{selectedEmployee.position || 'Team Member'}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Employee
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Contact Information</h4>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="h-4 w-4" /></div>
                    <span className="text-slate-600 font-medium">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="h-4 w-4" /></div>
                    <span className="text-slate-600 font-medium">{selectedEmployee.phone || 'No phone added'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><MapPin className="h-4 w-4" /></div>
                    <span className="text-slate-600 font-medium leading-tight">{selectedEmployee.address || 'No address added'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Work Details</h4>
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Briefcase className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                      <p className="text-slate-900 font-bold">{(selectedEmployee as any).departments?.name || 'General Operations'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Calendar className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Joined Date</p>
                      <p className="text-slate-900 font-bold">{formatDate(selectedEmployee.hire_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4">
                <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-xl">
                  <ExternalLink className="h-4 w-4" /> View Attendance History
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 h-12 w-12 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
