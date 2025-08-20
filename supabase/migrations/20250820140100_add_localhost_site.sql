-- Add localhost site for development testing
INSERT INTO sites (user_id, domain, name) 
VALUES ('abceca63-d42f-44e3-8061-4c19f86e4df5', 'localhost', 'Local Development Site')
ON CONFLICT (domain) DO NOTHING;