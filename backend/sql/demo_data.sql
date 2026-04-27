-- SafeFlow Global — Realistic Demo Data (Schema Corrected)

-- Add more workers
INSERT INTO workers (phone_number, name, region, district, emergency_contact, emergency_contact_name, profile_verified)
VALUES 
    ('+919000000004', 'Vikram Singh', 'IN-DL', 'South Delhi', '+919000000040', 'Sita Singh', true),
    ('+919000000005', 'Anjali Rao', 'IN-KA', 'Bangalore', '+919000000050', 'Kiran Rao', true),
    ('+919000000006', 'Deepak Varma', 'IN-MH', 'Pune', '+919000000060', 'Meena Varma', false)
ON CONFLICT (phone_number) DO NOTHING;

-- Add more contractors
INSERT INTO contractors (name, registration_number, region, risk_score, total_jobs, total_incidents, is_blacklisted)
VALUES
    ('Bharat Infra Solutions', 'BIS-9922', 'IN-DL', 8.5, 450, 2, false),
    ('Cauvery Drainage Corp', 'CDC-4411', 'IN-KA', 4.2, 120, 8, false),
    ('Urban Pipe Masters', 'UPM-7700', 'IN-MH', 2.1, 85, 12, true);

-- Add some active check-ins (to show in dashboard)
INSERT INTO job_checkins (worker_id, contractor_id, sewer_depth, estimated_duration, risk_level, risk_score, status, started_at, deadline)
VALUES
    ((SELECT id FROM workers WHERE name = 'Rajesh Kumar' LIMIT 1), (SELECT id FROM contractors WHERE name = 'Metro Sanitation Corp' LIMIT 1), 10.5, 60, 'YELLOW', 6, 'active', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes'),
    ((SELECT id FROM workers WHERE name = 'Vikram Singh' LIMIT 1), (SELECT id FROM contractors WHERE name = 'Bharat Infra Solutions' LIMIT 1), 5.0, 120, 'GREEN', 3, 'active', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '105 minutes'),
    ((SELECT id FROM workers WHERE name = 'Anjali Rao' LIMIT 1), (SELECT id FROM contractors WHERE name = 'Cauvery Drainage Corp' LIMIT 1), 15.2, 45, 'RED', 9, 'active', NOW() - INTERVAL '40 minutes', NOW() + INTERVAL '5 minutes');

-- Add some past incidents
INSERT INTO incidents (incident_type, severity, description, status, worker_id, contractor_id, country, region, authority_notified, reported_at)
VALUES
    ('gas_leak', 'critical', 'H2S levels exceeded safety limits in Sector 4.', 'resolved', (SELECT id FROM workers LIMIT 1), (SELECT id FROM contractors LIMIT 1), 'India', 'IN-MH', true, NOW() - INTERVAL '5 days'),
    ('structural_collapse', 'high', 'Partial wall collapse in old drainage tunnel.', 'resolved', (SELECT id FROM workers OFFSET 1 LIMIT 1), (SELECT id FROM contractors OFFSET 1 LIMIT 1), 'India', 'IN-TN', true, NOW() - INTERVAL '12 days');
