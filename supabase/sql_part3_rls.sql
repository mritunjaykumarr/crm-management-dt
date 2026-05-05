-- Enable RLS on all tables
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

-- Employees policies
CREATE POLICY "auth_read_employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_employees" ON employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_employees" ON employees FOR UPDATE TO authenticated USING (true);

-- User roles policies
CREATE POLICY "auth_read_roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (true);

-- Attendance policies
CREATE POLICY "auth_read_attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_attendance" ON attendance FOR UPDATE TO authenticated USING (true);

-- Leave requests policies
CREATE POLICY "auth_read_leave_requests" ON leave_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_leave_requests" ON leave_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_leave_requests" ON leave_requests FOR UPDATE TO authenticated USING (true);

-- Leave balances & types policies
CREATE POLICY "auth_read_leave_balances" ON leave_balances FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_leave_types" ON leave_types FOR SELECT TO authenticated USING (true);

-- Tasks policies
CREATE POLICY "auth_read_tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- Departments policies
CREATE POLICY "auth_read_departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_departments" ON departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_departments" ON departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_departments" ON departments FOR DELETE TO authenticated USING (true);

-- Calendar events policies
CREATE POLICY "auth_read_events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_delete_events" ON calendar_events FOR DELETE TO authenticated USING (true);

-- Holidays policies
CREATE POLICY "auth_read_holidays" ON holidays FOR SELECT TO authenticated USING (true);

-- Task comments & attachments policies
CREATE POLICY "auth_read_comments" ON task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_comments" ON task_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_read_attachments" ON task_attachments FOR SELECT TO authenticated USING (true);
