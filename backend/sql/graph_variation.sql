-- SafeFlow Global — More Variation for Risk Graph

-- Add more workers to support more check-ins
INSERT INTO workers (phone_number, name, region, district, emergency_contact, profile_verified)
VALUES 
    ('+919000000011', 'Rahul Jha', 'IN-MH', 'Thane', '+919000000110', true),
    ('+919000000012', 'Sita Ram', 'IN-DL', 'North Delhi', '+919000000120', true),
    ('+919000000013', 'Gopal Das', 'IN-KA', 'Mysore', '+919000000130', true),
    ('+919000000014', 'Meera Bai', 'IN-TN', 'Madurai', '+919000000140', true),
    ('+919000000015', 'Amit Shah', 'IN-MH', 'Nagpur', '+919000000150', true),
    ('+919000000016', 'Pooja Hegde', 'IN-KA', 'Hubli', '+919000000160', true),
    ('+919000000017', 'Karan Johar', 'IN-MH', 'Mumbai', '+919000000170', false),
    ('+919000000018', 'Salman Khan', 'IN-DL', 'West Delhi', '+919000000180', true),
    ('+919000000019', 'Hrithik Roshan', 'IN-MH', 'Pune', '+919000000190', true),
    ('+919000000020', 'Deepika P', 'IN-KA', 'Bangalore', '+919000000200', true)
ON CONFLICT (phone_number) DO NOTHING;

-- Add 10 more skewed active check-ins
-- Target: 6 Green, 3 Yellow, 1 Red
INSERT INTO job_checkins (worker_id, contractor_id, sewer_depth, estimated_duration, risk_level, risk_score, status, started_at, deadline)
VALUES
    -- Green (6)
    ((SELECT id FROM workers WHERE name = 'Rahul Jha' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 3.2, 120, 'GREEN', 1, 'active', NOW(), NOW() + INTERVAL '2 hours'),
    ((SELECT id FROM workers WHERE name = 'Sita Ram' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 4.5, 90, 'GREEN', 2, 'active', NOW(), NOW() + INTERVAL '90 minutes'),
    ((SELECT id FROM workers WHERE name = 'Gopal Das' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 2.1, 60, 'GREEN', 1, 'active', NOW(), NOW() + INTERVAL '1 hour'),
    ((SELECT id FROM workers WHERE name = 'Meera Bai' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 5.5, 180, 'GREEN', 3, 'active', NOW(), NOW() + INTERVAL '3 hours'),
    ((SELECT id FROM workers WHERE name = 'Amit Shah' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 3.0, 45, 'GREEN', 2, 'active', NOW(), NOW() + INTERVAL '45 minutes'),
    ((SELECT id FROM workers WHERE name = 'Pooja Hegde' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 4.0, 120, 'GREEN', 2, 'active', NOW(), NOW() + INTERVAL '2 hours'),
    
    -- Yellow (3)
    ((SELECT id FROM workers WHERE name = 'Karan Johar' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 12.5, 60, 'YELLOW', 5, 'active', NOW(), NOW() + INTERVAL '1 hour'),
    ((SELECT id FROM workers WHERE name = 'Salman Khan' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 11.2, 90, 'YELLOW', 6, 'active', NOW(), NOW() + INTERVAL '90 minutes'),
    ((SELECT id FROM workers WHERE name = 'Hrithik Roshan' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 10.8, 45, 'YELLOW', 4, 'active', NOW(), NOW() + INTERVAL '45 minutes'),
    
    -- Red (1)
    ((SELECT id FROM workers WHERE name = 'Deepika P' LIMIT 1), (SELECT id FROM contractors LIMIT 1), 22.5, 30, 'RED', 9, 'active', NOW(), NOW() + INTERVAL '30 minutes');
