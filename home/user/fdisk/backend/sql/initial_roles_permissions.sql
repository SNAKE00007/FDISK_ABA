-- Insert roles
INSERT INTO roles (name, description) VALUES
('LBD', 'Landesbranddirektor - Chief of State Fire Department'),
('LBDS', 'Landesbranddirektor Stellvertreter - Deputy Chief of State Fire Department'),
('LFR', 'Landesfeuerwehrrat - State Fire Department Council Member'),
('OBR', 'Oberbrandrat - District Fire Chief'),
('BR', 'Brandrat - District Fire Deputy Chief'),
('HBI', 'Hauptbrandinspektor - Local Fire Department Commander'),
('OBI', 'Ortsbrandinspektor - Local Fire Department Commander');

-- Insert base permissions
INSERT INTO permissions (name, description) VALUES
('manage_equipment', 'Can manage equipment inventory'),
('view_equipment', 'Can view equipment inventory'),
('manage_reports', 'Can create and edit reports'),
('view_reports', 'Can view reports'),
('manage_members', 'Can manage department members'),
('view_members', 'Can view department members'),
('manage_bfvs', 'Can manage BFVs'),
('view_bfvs', 'Can view BFVs'),
('manage_abschnitte', 'Can manage Abschnitte'),
('view_abschnitte', 'Can view Abschnitte'),
('assign_commander', 'Can assign commanders to departments'),
('manage_departments', 'Can manage departments'),
('view_departments', 'Can view departments'),
('manage_users', 'Can manage user accounts'),
('view_users', 'Can view user accounts');

-- Let's do the permission hierarchy updates one at a time to avoid subquery issues
UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_equipment' AND p2.name = 'manage_equipment';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_reports' AND p2.name = 'manage_reports';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_members' AND p2.name = 'manage_members';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_bfvs' AND p2.name = 'manage_bfvs';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_abschnitte' AND p2.name = 'manage_abschnitte';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_departments' AND p2.name = 'manage_departments';

UPDATE permissions p1, permissions p2
SET p1.parent_permission_id = p2.id
WHERE p1.name = 'view_users' AND p2.name = 'manage_users';

-- Create temporary table for user permissions
CREATE TEMPORARY TABLE temp_user_permissions (
    user_id INT,
    permission_id INT,
    granted_by INT
);

-- Insert permissions for LBD, LBDS, and LFR into temporary table
INSERT INTO temp_user_permissions (user_id, permission_id, granted_by)
SELECT DISTINCT
    ur.user_id,
    p.id as permission_id,
    ur.assigned_by
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
CROSS JOIN permissions p
WHERE r.name IN ('LBD', 'LBDS', 'LFR')
AND ur.is_active = true;

-- Insert permissions for OBR and BR into temporary table
INSERT INTO temp_user_permissions (user_id, permission_id, granted_by)
SELECT DISTINCT
    ur.user_id,
    p.id as permission_id,
    ur.assigned_by
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN permissions p ON p.name IN (
    'view_departments',
    'manage_departments',
    'assign_commander',
    'view_abschnitte',
    'manage_abschnitte',
    'view_members',
    'view_equipment',
    'view_reports'
)
WHERE r.name IN ('OBR', 'BR')
AND ur.is_active = true;

-- Insert permissions for HBI and OBI into temporary table
INSERT INTO temp_user_permissions (user_id, permission_id, granted_by)
SELECT DISTINCT
    ur.user_id,
    p.id as permission_id,
    ur.assigned_by
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN permissions p ON p.name IN (
    'manage_equipment',
    'view_equipment',
    'manage_reports',
    'view_reports',
    'manage_members',
    'view_members',
    'manage_users',
    'view_users'
)
WHERE r.name IN ('HBI', 'OBI')
AND ur.is_active = true;

-- Insert from temporary table to actual user_permissions table
INSERT INTO user_permissions (user_id, permission_id, granted_by)
SELECT DISTINCT user_id, permission_id, granted_by
FROM temp_user_permissions;

-- Clean up
DROP TEMPORARY TABLE IF EXISTS temp_user_permissions; 