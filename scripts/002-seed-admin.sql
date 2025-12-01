-- Seed admin user (password: admin123 - hashed with bcrypt)
-- You should change this password after first login
INSERT INTO "User" ("id", "username", "password", "fullName", "role", "hasVotedOsis", "hasVotedMpk", "createdAt", "updatedAt")
VALUES (
    'admin-default-001',
    'admin',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    'Administrator',
    'ADMIN',
    false,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;
