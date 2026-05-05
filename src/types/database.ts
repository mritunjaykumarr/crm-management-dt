export type UserRole = 'admin' | 'hr' | 'employee'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface Department {
  id: string
  name: string
  description?: string
  head_id?: string
  created_at: string
  updated_at: string
  employee_count?: number
}

export interface Employee {
  id: string
  user_id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department_id?: string
  department?: Department
  position: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'on_leave'
  scheduled_check_in?: string
  dob?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  employee?: Employee
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'late' | 'half_day'
  hours_worked?: number
  notes?: string
  created_at: string
}

export interface LeaveType {
  id: string
  name: string
  description?: string
  days_per_year: number
  color: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  employee?: Employee
  leave_type_id: string
  leave_type?: LeaveType
  start_date: string
  end_date: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  leave_type?: LeaveType
  total_days: number
  used_days: number
  remaining_days: number
  year: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  type: 'meeting' | 'event' | 'deadline' | 'other'
  color?: string
  created_by: string
  created_at: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  type: 'public' | 'company' | 'optional'
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string
  assigned_employee?: Employee
  assigned_by: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  user_name?: string
  content: string
  created_at: string
}

export interface TaskAttachment {
  id: string
  task_id: string
  file_name: string
  file_url: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export interface DashboardStats {
  totalEmployees: number
  presentToday: number
  pendingLeaves: number
  activeTasks: number
  departments: number
  upcomingHolidays: number
}
