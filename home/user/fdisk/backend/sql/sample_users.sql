-- Create necessary departments first
INSERT INTO departments (name) VALUES
('Landesfeuerwehrverband Steiermark'),    -- Top level department for LBD
('BFV Liezen');                           -- Department for OBR

-- Get department IDs
SET @lfv_dept_id = (SELECT id FROM departments WHERE name = 'Landesfeuerwehrverband Steiermark' ORDER BY id DESC LIMIT 1);
SET @bfv_dept_id = (SELECT id FROM departments WHERE name = 'BFV Liezen' ORDER BY id DESC LIMIT 1);

-- First ensure we have the correct member entries for our users
INSERT INTO members (dienstgrad, department_id) VALUES
('LBD', @lfv_dept_id),    -- LBD belongs to LFV Steiermark
('OBR', @bfv_dept_id);    -- OBR belongs to BFV Liezen

-- Get member IDs (get the most recently created ones)
SET @lbd_member_id = (SELECT id FROM members WHERE dienstgrad = 'LBD' AND department_id = @lfv_dept_id ORDER BY id DESC LIMIT 1);
SET @obr_member_id = (SELECT id FROM members WHERE dienstgrad = 'OBR' AND department_id = @bfv_dept_id ORDER BY id DESC LIMIT 1);

-- Insert sample users with correct member_id and department_id references
INSERT INTO users (username, password, member_id, is_active, department_id, role) VALUES
('franz.mueller.lbd', '$2a$10$somehashedpassword', @lbd_member_id, 1, @lfv_dept_id, 'LBD'),  -- LBD in LFV Steiermark
('thomas.wagner.obr', '$2a$10$somehashedpassword', @obr_member_id, 1, @bfv_dept_id, 'OBR');  -- OBR in BFV Liezen

-- Get the role IDs
SET @lbd_role_id = (SELECT id FROM roles WHERE name = 'LBD' LIMIT 1);
SET @obr_role_id = (SELECT id FROM roles WHERE name = 'OBR' LIMIT 1);

-- Get the user IDs (get the most recently created ones)
SET @franz_id = (SELECT id FROM users WHERE username = 'franz.mueller.lbd' ORDER BY id DESC LIMIT 1);
SET @thomas_id = (SELECT id FROM users WHERE username = 'thomas.wagner.obr' ORDER BY id DESC LIMIT 1);

-- Create a sample BFV (Bereichsfeuerwehrverband)
INSERT INTO bfvs (name) VALUES
('Liezen');

SET @bfv_liezen_id = (SELECT id FROM bfvs WHERE name = 'Liezen' ORDER BY id DESC LIMIT 1);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by, bfv_id) VALUES
(@franz_id, @lbd_role_id, @franz_id, NULL),                    -- Franz Müller as LBD (no specific BFV)
(@thomas_id, @obr_role_id, @franz_id, @bfv_liezen_id);        -- Thomas Wagner as OBR for BFV Liezen

-- Insert default permissions for LBD (they get all permissions)
INSERT INTO user_permissions (user_id, permission_id, granted_by)
SELECT 
    @franz_id,
    p.id as permission_id,
    @franz_id
FROM permissions p;

-- Insert permissions for OBR
INSERT INTO user_permissions (user_id, permission_id, granted_by)
SELECT 
    @thomas_id,
    p.id as permission_id,
    @franz_id
FROM permissions p
WHERE p.name IN (
    'view_departments',
    'manage_departments',
    'assign_commander',
    'view_abschnitte',
    'manage_abschnitte',
    'view_members',
    'view_equipment',
    'view_reports'
);

-- Update password for user ID 4
UPDATE users 
SET password = '$2a$10$uwCAqBiignFhSZPbyX35Y.u./isqcVzq1TLTlyP89qyHi0JnNI3kC'
WHERE id = 4; 