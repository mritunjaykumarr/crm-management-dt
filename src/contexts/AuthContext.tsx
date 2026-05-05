import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserRole, UserProfile } from '@/types/database'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isHR: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole>('employee')
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      // 1. Get User Metadata (to check for roles set during signup)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const metaRole = authUser?.user_metadata?.role as UserRole
      const metaName = authUser?.user_metadata?.full_name

      // 2. Get or Create Role
      let { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (!roleData) {
        const roleToSet = metaRole || 'employee'
        const { data: newRole } = await supabase.from('user_roles').insert({ user_id: userId, role: roleToSet }).select().single()
        roleData = newRole
      }

      const userRole = (roleData?.role as UserRole) || 'employee'
      setRole(userRole)

      // 3. Get or Create Record (Search ALL tables to be safe)
      let profileData = null
      let activeTable = 'employees'

      // Priority search based on role, but fallback to others
      const tables = userRole === 'admin' ? ['administrators', 'hr_managers', 'employees'] : 
                     userRole === 'hr' ? ['hr_managers', 'employees', 'administrators'] : 
                     ['employees', 'hr_managers', 'administrators']

      for (const table of tables) {
        try {
          const { data, error: fetchError } = await supabase.from(table).select('*').eq('user_id', userId).maybeSingle()
          // If table doesn't exist (404), it will return an error, but we skip it
          if (data && !fetchError) {
            profileData = data
            activeTable = table
            break
          }
        } catch (e) {
          // Table likely doesn't exist, ignore and continue
          continue
        }
      }

      if (!profileData) {
        // Fallback: Default to employees table if nothing found anywhere
        const tableName = 'employees'
        const [firstName, ...lastParts] = metaName ? metaName.split(' ') : (userEmail.split('@')[0]).split('.')
        const insertData = {
          user_id: userId,
          first_name: firstName,
          last_name: lastParts.join(' ') || '',
          email: userEmail,
          position: userRole === 'admin' ? 'Administrator' : userRole === 'hr' ? 'HR Manager' : 'Employee',
          status: 'active',
          hire_date: new Date().toISOString().split('T')[0]
        }
        
        const { data: newProfile, error: insertError } = await supabase.from(tableName).insert(insertData).select().single()
        if (insertError) throw insertError
        profileData = newProfile
        activeTable = tableName
      }

      setProfile({
        id: profileData.id, // The UUID from the table, NOT the auth user id
        user_id: userId,
        email: userEmail,
        full_name: `${profileData.first_name} ${profileData.last_name}`,
        avatar_url: (profileData as any).avatar_url,
        role: userRole,
        created_at: (profileData as any).created_at || new Date().toISOString(),
      })
    } catch (err) {
      console.error('Profile fetch/create error:', err)
      setRole('employee')
      setProfile({
        id: userId,
        email: userEmail,
        full_name: userEmail.split('@')[0],
        role: 'employee',
        created_at: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '')
      } else {
        setProfile(null)
        setRole('employee')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, requestedRole?: UserRole, masterKey?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) return { error: new Error(error.message) }

    if (data.user && requestedRole && requestedRole !== 'employee' && masterKey) {
      // Auto-promote if the correct key is provided during login
      const { data: secret } = await supabase
        .from('role_secrets')
        .select('secret_code')
        .eq('role', requestedRole)
        .single()
      
      if (secret && secret.secret_code === masterKey) {
        await supabase.from('user_roles').upsert({ user_id: data.user.id, role: requestedRole })
        
        // Move record to the correct table if needed
        const tableName = requestedRole === 'admin' ? 'administrators' : 'hr_managers'
        const [firstName, ...lastParts] = (data.user.user_metadata?.full_name || '').split(' ')
        
        await supabase.from(tableName).upsert({ 
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastParts.join(' ') || '',
          email: data.user.email
        })

        // Delete from old table if they were an employee
        await supabase.from('employees').delete().eq('user_id', data.user.id)
      }
    }
    
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string, selectedRole: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          role: selectedRole 
        } 
      },
    })

    if (error) return { error: new Error(error.message) }

    if (data.user) {
      try {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: selectedRole,
        })

        const tableName = selectedRole === 'admin' ? 'administrators' : selectedRole === 'hr' ? 'hr_managers' : 'employees'
        const [firstName, ...lastParts] = fullName.split(' ')
        
        const insertData = {
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastParts.join(' ') || '',
          email,
          ...(selectedRole === 'employee' ? {
            position: 'Employee',
            hire_date: new Date().toISOString().split('T')[0],
            status: 'active',
          } : {})
        }

        await supabase.from(tableName).insert(insertData)
      } catch (e) {
        console.log('Post-signup inserts pending email confirmation...')
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    setRole('employee')
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin: role === 'admin',
        isHR: role === 'hr',
        isEmployee: role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
