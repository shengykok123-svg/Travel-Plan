-- Roles: super (one account), admin, editor, viewer
ALTER TABLE members ADD COLUMN role TEXT NOT NULL DEFAULT 'editor';
ALTER TABLE members ADD COLUMN last_login INTEGER NOT NULL DEFAULT 0;
UPDATE members SET role = CASE WHEN is_admin = 1 THEN 'super' ELSE 'editor' END;
