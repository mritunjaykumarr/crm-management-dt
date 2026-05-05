import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarOff,
  CalendarDays,
  ListTodo,
  BarChart3,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Anchor,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: Users, roles: ['admin', 'hr'] },
  { label: 'Departments', path: '/departments', icon: Building2, roles: ['admin', 'hr'] },
  { label: 'Attendance', path: '/attendance', icon: Clock },
  { label: 'Leave', path: '/leave', icon: CalendarOff },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Tasks', path: '/tasks', icon: ListTodo },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  { label: 'Profile', path: '/profile', icon: UserCircle },
]

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const { role, profile, signOut } = useAuth()
  const location = useLocation()

  const filteredItems = navItems.filter(
    item => !item.roles || item.roles.includes(role)
  )

  const roleBadgeColor = {
    admin: 'bg-amber-500/20 text-amber-300',
    hr: 'bg-purple-500/20 text-purple-300',
    employee: 'bg-blue-500/20 text-blue-300',
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static text-white',
        role === 'admin' ? 'bg-amber-950 border-r border-amber-900/50' : 
        role === 'hr' ? 'bg-indigo-950 border-r border-indigo-900/50' : 
        'bg-sidebar',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className={cn(
        'flex h-16 items-center border-b border-white/10 px-4',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-sm flex-shrink-0">
          <Anchor className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold tracking-tight text-white">Digi Captain</h1>
            <p className="text-[10px] text-sidebar-muted tracking-wider uppercase">CRM Suite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-sidebar-muted hover:bg-white/5 hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-400')} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center h-10 mx-3 mb-2 rounded-lg text-sidebar-muted hover:bg-white/5 hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User area */}
      <div className={cn(
        'border-t border-white/10 p-3',
        isCollapsed && 'flex flex-col items-center'
      )}>
        <div className={cn('flex items-center gap-3', isCollapsed && 'flex-col')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold flex-shrink-0">
            {getInitials(profile?.full_name || 'U')}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="h-3 w-3 text-sidebar-muted" />
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded', roleBadgeColor[role])}>
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-sidebar-muted hover:bg-white/5 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
