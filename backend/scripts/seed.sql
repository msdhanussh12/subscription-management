-- Subscription Management Seed Data

USE subscription_management;

-- Clear existing data cleanly (in dependency order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE plans;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Default Admin User (Password: "Admin@123")
-- bcrypt hash for "Admin@123" with salt rounds 10
INSERT INTO users (name, email, password_hash) VALUES
('Alex Johnson', 'admin@example.com', '$2a$10$iZk8M9XyH1GZ18tF59yZlONN3Uv7t1EwWpZ4vG7uB3yL8sR.kP3dK'),
('Sarah Connor', 'demo@example.com', '$2a$10$iZk8M9XyH1GZ18tF59yZlONN3Uv7t1EwWpZ4vG7uB3yL8sR.kP3dK');

-- 2. Insert Subscription Plans
INSERT INTO plans (id, plan_name, price, billing_cycle, description) VALUES
(1, 'Starter Monthly', 499.00, 'Monthly', 'Perfect for small teams starting out with core subscription management features.'),
(2, 'Professional Monthly', 1499.00, 'Monthly', 'Advanced workflows, multi-user seats, analytics, and priority email support.'),
(3, 'Enterprise Monthly', 4999.00, 'Monthly', 'Dedicated account manager, custom API limits, SLA, and custom domain setup.'),
(4, 'Starter Yearly', 4990.00, 'Yearly', 'Starter plan billed annually with 2 months free equivalent savings.'),
(5, 'Professional Yearly', 14990.00, 'Yearly', 'Our most popular annual tier for growing businesses, saved 17% vs monthly.'),
(6, 'Enterprise Yearly', 49900.00, 'Yearly', 'Full enterprise suite with annual invoicing and dedicated 24/7 technical hotline.');

-- 3. Insert Customers
INSERT INTO customers (id, name, email, phone, company, address) VALUES
(1, 'Alice Walker', 'alice@innovatetech.io', '+1 555-0101', 'InnovateTech Solutions', '100 Silicon Way, San Jose, CA 95110'),
(2, 'Bob Martinez', 'bob@cloudburst.co', '+1 555-0102', 'CloudBurst Digital', '456 Market St, Suite 800, San Francisco, CA 94105'),
(3, 'Catherine Zhang', 'catherine@nexuslogistics.com', '+1 555-0103', 'Nexus Logistics', '789 Industrial Pkwy, Chicago, IL 60607'),
(4, 'David Kumar', 'david@kumarretail.in', '+91 98765 43210', 'Kumar Retail Group', '12 Brigade Road, Bangalore, KA 560001'),
(5, 'Elena Rostova', 'elena@solarpulse.eu', '+44 20 7946 0912', 'SolarPulse Energy', '22 Baker Street, London, NW1 6XE, UK'),
(6, 'Franklin Pierce', 'franklin@apexmedia.net', '+1 555-0106', 'Apex Creative Media', '303 Peachtree St, Atlanta, GA 30308'),
(7, 'Grace Hopper', 'grace@quantumcore.dev', '+1 555-0107', 'QuantumCore Systems', '500 Technology Square, Cambridge, MA 02139'),
(8, 'Henry Ford Jr.', 'henry@aerodrive.org', '+1 555-0108', 'AeroDrive Mobility', '1200 Woodward Ave, Detroit, MI 48226');

-- 4. Insert Subscriptions
INSERT INTO subscriptions (id, customer_id, plan_id, start_date, end_date, price, billing_cycle, status) VALUES
(1, 1, 2, '2026-01-15', '2026-02-15', 1499.00, 'Monthly', 'Active'),
(2, 2, 5, '2025-11-01', '2026-11-01', 14990.00, 'Yearly', 'Active'),
(3, 3, 1, '2026-02-01', '2026-03-01', 499.00, 'Monthly', 'Active'),
(4, 4, 3, '2026-01-01', '2026-02-01', 4999.00, 'Monthly', 'Active'),
(5, 5, 4, '2025-06-15', '2026-06-15', 4990.00, 'Yearly', 'Active'),
(6, 6, 2, '2025-10-01', '2025-11-01', 1499.00, 'Monthly', 'Cancelled'),
(7, 7, 6, '2026-02-10', '2027-02-10', 49900.00, 'Yearly', 'Active'),
(8, 8, 1, '2025-08-01', '2025-09-01', 499.00, 'Monthly', 'Expired'),
(9, 1, 4, '2025-01-10', '2026-01-10', 4990.00, 'Yearly', 'Expired'),
(10, 3, 2, '2025-12-01', '2026-01-01', 1499.00, 'Monthly', 'Cancelled'),
(11, 4, 5, '2026-01-20', '2027-01-20', 14990.00, 'Yearly', 'Active'),
(12, 7, 1, '2025-05-01', '2025-06-01', 499.00, 'Monthly', 'Expired');
