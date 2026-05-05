import React from 'react'
import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-slate-50 text-slate-700 border-slate-200',
}

export function StatusBadge({ label, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      variantStyles[variant],
      className
    )}>
      {label}
    </span>
  )
}

export function getStatusVariant(status: string): StatusVariant {
  const map: Record<string, StatusVariant> = {
    active: 'success',
    present: 'success',
    approved: 'success',
    completed: 'success',
    inactive: 'error',
    absent: 'error',
    rejected: 'error',
    late: 'warning',
    pending: 'warning',
    in_progress: 'info',
    review: 'info',
    on_leave: 'warning',
    half_day: 'warning',
    todo: 'default',
    low: 'info',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  }
  return map[status.toLowerCase()] || 'default'
}
