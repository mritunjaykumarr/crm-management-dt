-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Seed leave types
INSERT INTO leave_types (name, description, days_per_year, color) VALUES
  ('Casual Leave', 'For personal matters', 12, '#3b82f6');
INSERT INTO leave_types (name, description, days_per_year, color) VALUES
  ('Sick Leave', 'For medical reasons', 10, '#ef4444');
INSERT INTO leave_types (name, description, days_per_year, color) VALUES
  ('Earned Leave', 'Earned/privilege leave', 15, '#10b981');
INSERT INTO leave_types (name, description, days_per_year, color) VALUES
  ('Maternity Leave', 'Maternity/paternity leave', 180, '#8b5cf6');
