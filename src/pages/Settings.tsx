import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { useEmployees } from '@/hooks/useEmployees'
import { Globe, Bell, Shield, Database, UserCog } from 'lucide-react'

export default function Settings() {
  const { addToast } = useToast()
  const { isAdmin } = useAuth()
  const { employees, updateRole } = useEmployees()
  
  const [settings, setSettings] = useState({
    companyName: 'Digi Captain Inc.',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    workingHours: '09:00 - 18:00',
    emailNotifications: true,
    leaveApprovalRequired: true,
    maxLeavePerMonth: 3,
    attendanceGracePeriod: 15,
  })

  const handleSave = () => {
    addToast('success', 'Settings saved', 'Your changes have been saved successfully.')
  }

  const sections = [
    {
      icon: Globe, title: 'General', description: 'Company and regional settings',
      fields: [
        { label: 'Company Name', key: 'companyName', type: 'text' },
        { label: 'Timezone', key: 'timezone', type: 'select', options: ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] },
        { label: 'Date Format', key: 'dateFormat', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
        { label: 'Working Hours', key: 'workingHours', type: 'text' },
      ],
    },
    {
      icon: Bell, title: 'Notifications', description: 'Email and alert preferences',
      fields: [
        { label: 'Email Notifications', key: 'emailNotifications', type: 'toggle' },
      ],
    },
    {
      icon: Shield, title: 'Leave Policy', description: 'Leave management rules',
      fields: [
        { label: 'Approval Required', key: 'leaveApprovalRequired', type: 'toggle' },
        { label: 'Max Leaves Per Month', key: 'maxLeavePerMonth', type: 'number' },
      ],
    },
    {
      icon: Database, title: 'Attendance', description: 'Attendance tracking settings',
      fields: [
        { label: 'Grace Period (minutes)', key: 'attendanceGracePeriod', type: 'number' },
      ],
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Configure system preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="text-sm font-semibold text-slate-900">{section.title}</h3><p className="text-xs text-slate-500">{section.description}</p></div>
                </div>
                <div className="space-y-4">
                  {section.fields.map(field => (
                    <div key={field.key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">{field.label}</label>
                      {field.type === 'toggle' ? (
                        <button
                          onClick={() => setSettings(s => ({ ...s, [field.key]: !s[field.key as keyof typeof settings] }))}
                          className={`relative h-6 w-11 rounded-full transition-colors ${settings[field.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[field.key as keyof typeof settings] ? 'translate-x-5' : ''}`} />
                        </button>
                      ) : field.type === 'select' ? (
                        <select value={String(settings[field.key as keyof typeof settings])} onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))} className="rounded-lg border border-slate-200 py-1.5 px-3 text-sm outline-none focus:border-blue-500 min-w-[200px]">
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} value={String(settings[field.key as keyof typeof settings])} onChange={e => setSettings(s => ({ ...s, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))} className="rounded-lg border border-slate-200 py-1.5 px-3 text-sm outline-none focus:border-blue-500 min-w-[200px]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          
          <div className="flex justify-end">
            <button onClick={handleSave} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25">
              Save All Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-purple-100 p-2 text-purple-600"><UserCog className="h-5 w-5" /></div>
                <div><h3 className="text-sm font-semibold text-slate-900">User Roles</h3><p className="text-xs text-slate-500">Promote or manage access</p></div>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{emp.first_name} {emp.last_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{emp.position}</p>
                    </div>
                    <select 
                      defaultValue="employee"
                      onChange={(e) => emp.user_id && updateRole(emp.user_id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-1 outline-none focus:border-purple-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ))}
                {employees.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No employees found</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
