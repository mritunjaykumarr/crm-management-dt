import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Users, ShieldAlert, ShieldCheck, ArrowRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'

export default function Landing() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [selectedRole, setSelectedRole] = useState<'employee' | 'hr' | 'admin' | null>(null)
  const [accessKey, setAccessKey] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleRoleSelect = (role: 'employee' | 'hr' | 'admin') => {
    if (role === 'employee') {
      navigate('/auth?role=employee')
    } else {
      setSelectedRole(role)
    }
  }

  const verifyAccessKey = async () => {
    if (!selectedRole) return
    setVerifying(true)
    try {
      const { data, error } = await supabase
        .from('role_secrets')
        .select('secret_code')
        .eq('role', selectedRole)
        .single()

      if (error || data?.secret_code !== accessKey) {
        addToast('error', 'Invalid Access Key', 'Please contact the IT administrator.')
        return
      }

      // Success - Redirect to Auth with the verified role
      addToast('success', 'Access Verified', `Redirecting to ${selectedRole.toUpperCase()} portal.`)
      navigate(`/auth?role=${selectedRole}&key=${accessKey}`)
    } catch (err) {
      addToast('error', 'Verification Failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />

      <div className="z-10 max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <Anchor className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Digi Captain <span className="text-blue-400">CRM Suite</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
            Select your portal to begin. Elevated access requires a master security key.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Card */}
          <button
            onClick={() => handleRoleSelect('employee')}
            className="group relative bg-slate-800/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-800 transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 text-left"
          >
            <div className="h-12 w-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Employees</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Access your personal dashboard, track attendance and manage tasks.</p>
            <div className="flex items-center text-blue-400 text-sm font-semibold gap-2">
              Enter Portal <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* HR Card */}
          <button
            onClick={() => handleRoleSelect('hr')}
            className="group relative bg-slate-800/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-800 transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 text-left"
          >
            <div className="h-12 w-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">HR Manager</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Manage workforce data, departments and employee performance.</p>
            <div className="flex items-center text-purple-400 text-sm font-semibold gap-2">
              Unlock Portal <Lock className="h-4 w-4" />
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => handleRoleSelect('admin')}
            className="group relative bg-slate-800/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-800 transition-all hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 text-left"
          >
            <div className="h-12 w-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Director</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">God-mode access. View company reports and manage system roles.</p>
            <div className="flex items-center text-amber-400 text-sm font-semibold gap-2">
              Unlock Portal <Lock className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Security Overlay */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => { setSelectedRole(null); setAccessKey(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center animate-bounce",
                  selectedRole === 'hr' ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"
                )}>
                  <Lock className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold capitalize">{selectedRole} Security</h2>
                <p className="text-slate-400 text-sm">Please enter the master access key for the {selectedRole} portal.</p>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Master Security Key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-4 px-5 text-center text-xl font-mono tracking-[0.5em] outline-none focus:border-blue-500 transition-all placeholder:tracking-normal placeholder:text-sm"
                  autoFocus
                />
                <button
                  onClick={verifyAccessKey}
                  disabled={verifying || !accessKey}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                    selectedRole === 'hr' ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20" : "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
                    "shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {verifying ? "Verifying..." : "Unlock Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
