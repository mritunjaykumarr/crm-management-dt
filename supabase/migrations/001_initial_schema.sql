-- Digi Captain CRM Suite — Full Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== DEPARTMENTS =====
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== EMPLOYEES =====
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position TEXT NOT NULL DEFAULT 'Employee',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave')),
  scheduled_check_in TIME,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== USER ROLES =====
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','hr','employee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ===== ATTENDANCE =====
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day')),
  hours_worked NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== LEAVE TYPES =====
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  days_per_year INTEGER NOT NULL DEFAULT 12,
  color TEXT DEFAULT '#3b82f6'
);

-- ===== LEAVE REQUESTS =====
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== LEAVE BALANCES =====
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id),
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  remaining_days INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
);

-- ===== CALENDAR EVENTS =====
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT DEFAULT 'event' CHECK (type IN ('meeting','event','deadline','other')),
  color TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== HOLIDAYS =====
CREATE TABLE IF NOT EXISTS holidays (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'public' CHECK (type IN ('public','company','optional')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TASKS =====
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TASK COMMENTS =====
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TASK ATTACHMENTS =====
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ===== SEED LEAVE TYPES =====
INSERT INTO leave_types (name, description, days_per_year, color) VALUES
  ('Casual Leave', 'For personal matters', 12, '#3b82f6'),
  ('Sick Leave', 'For medical reasons', 10, '#ef4444'),
  ('Earned Leave', 'Earned/privilege leave', 15, '#10b981'),
  ('Maternity Leave', 'Maternity/paternity leave', 180, '#8b5cf6')
ON CONFLICT DO NOTHING;

-- ===== RLS POLICIES =====
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data (simplest RLS for CRM)
CREATE POLICY "Authenticated users can read" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update" ON employees FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated read attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update attendance" ON attendance FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated read leave_requests" ON leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert leave_requests" ON leave_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update leave_requests" ON leave_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated read leave_balances" ON leave_balances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read leave_types" ON leave_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete tasks" ON tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert departments" ON departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update departments" ON departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete departments" ON departments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated read events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated delete events" ON calendar_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated read holidays" ON holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read comments" ON task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert comments" ON task_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated read attachments" ON task_attachments FOR SELECT TO authenticated USING (true);
