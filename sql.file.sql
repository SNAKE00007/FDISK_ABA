-- Drop existing tables if they exist
DROP TABLE IF EXISTS equipment_assignments;
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS reports;

-- Create roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Create members table
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dienstgrad VARCHAR(50),
    vorname VARCHAR(100),
    nachname VARCHAR(100),
    geburtsdatum DATE,
    eintrittsdatum DATE,
    telefonnummer VARCHAR(20),
    status VARCHAR(50)
);

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    member_id INT,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Rest of the tables remain the same
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    vehicle VARCHAR(100),
    replace_date DATE,
    notes TEXT,
    status VARCHAR(50),
    assigned_vehicle_id INT,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type VARCHAR(100) NOT NULL,
    members JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    member_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT,
    performed_by INT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (performed_by) REFERENCES members(id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
('commander'),
('second_commander'),
('cashier'),
('secretary'),
('firefighter');

-- Insert a test member
INSERT INTO members (vorname, nachname, dienstgrad, status) 
VALUES ('Admin', 'User', 'Commander', 'active');

-- Insert the admin user linked to the member
INSERT INTO users (username, password, role, member_id) 
VALUES ('admin', '$2a$10$TCGa97acOAydUarcE0uYCeyChcCEy1TKA0yia.0dpQ6EDaGbgIO7W', 'commander', 1);