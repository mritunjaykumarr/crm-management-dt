import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/page-header'
import { getInitials } from '@/lib/utils'
import { Camera, Mail, Shield, Calendar, Phone, MapPin, Heart } from 'lucide-react'

export default function Profile() {
  const { user, profile, role } = useAuth()
  const { addToast } = useToast()
  
  const [details, setDetails] = useState({
    phone: '',
    dob: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!user || !profile) return
      try {
        const tableName = role === 'admin' ? 'administrators' : role === 'hr' ? 'hr_managers' : 'employees'
        const { data, error } = await supabase
          .from(tableName)
          .select('phone, dob, address, emergency_contact_name, emergency_contact_phone')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (data) {
          setDetails({
            phone: (data as any).phone || '',
            dob: (data as any).dob || '',
            address: (data as any).address || '',
            emergency_contact_name: (data as any).emergency_contact_name || '',
            emergency_contact_phone: (data as any).emergency_contact_phone || ''
          })
        }
      } catch (err) {
        console.error('Error fetching profile details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfileDetails()
  }, [user, profile, role])

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setSaving(true)
    try {
      const tableName = role === 'admin' ? 'administrators' : role === 'hr' ? 'hr_managers' : 'employees'
      const { error } = await supabase
        .from(tableName)
        .update(details)
        .eq('user_id', user.id)
      
      if (error) throw error
      addToast('success', 'Profile updated', 'Your personal details have been saved.')
    } catch (err) {
      console.error('Error updating profile:', err)
      addToast('error', 'Update failed', 'Could not save personal details.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      addToast('error', 'Passwords do not match')
      return
    }
    setChanging(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new })
      if (error) throw error
      addToast('success', 'Password updated successfully')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      addToast('error', 'Failed to update password', String(err))
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader title="Profile" description="Manage your personal information and account security" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="relative inline-block mx-auto mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold shadow-lg">
                {getInitials(profile?.full_name || 'U')}
              </div>
              <button className="absolute -bottom-1 -right-1 rounded-full bg-white border border-slate-200 p-2 shadow-sm hover:bg-slate-50 transition-colors">
                <Camera className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'User'}</h2>
            <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Shield className="h-3 w-3 mr-1.5" />
              {role}
            </div>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400"><Mail className="h-4 w-4" /></div>
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400"><Calendar className="h-4 w-4" /></div>
                <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Security</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                <input type="password" required minLength={6} value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
                <input type="password" required minLength={6} value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={changing} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
                {changing ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Personal Details</h3>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>
            ) : (
              <form onSubmit={handleUpdateDetails} className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Phone className="h-3 w-3" />Phone Number</label>
                    <input type="tel" value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><Calendar className="h-3 w-3" />Date of Birth</label>
                    <input type="date" value={details.dob} onChange={e => setDetails(d => ({ ...d, dob: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase"><MapPin className="h-3 w-3" />Residential Address</label>
                  <textarea value={details.address} onChange={e => setDetails(d => ({ ...d, address: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500 resize-none" placeholder="Your full address..." />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4"><Heart className="h-4 w-4 text-red-500" />Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Contact Name</label>
                      <input type="text" value={details.emergency_contact_name} onChange={e => setDetails(d => ({ ...d, emergency_contact_name: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" placeholder="Full Name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Contact Phone</label>
                      <input type="tel" value={details.emergency_contact_phone} onChange={e => setDetails(d => ({ ...d, emergency_contact_phone: e.target.value }))} className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-blue-500" placeholder="Phone Number" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
