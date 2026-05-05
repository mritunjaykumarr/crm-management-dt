import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, Bell, Search } from 'lucide-react'
import { getGreeting } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/leave': 'Leave Management',
  '/calendar': 'Calendar',
  '/tasks': 'Tasks',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const { profile } = useAuth()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  )
}
