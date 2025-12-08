import { jest } from '@jest/globals';

// Definisikan mock function
export const requireAuth = jest.fn(async () => ({
  id: "user-123",
  username: "testuser",
  role: "USER",
  hasVotedOsis: false,
  hasVotedMpk: false,
}));

export const getCurrentUser = jest.fn(async () => ({
  id: "user-123",
  username: "testuser",
  role: "USER",
}));

export const requireRole = jest.fn(async () => ({
  id: "admin-123",
  username: "admin",
  role: "ADMIN",
}));

// Export object default untuk kompatibilitas test yang menggunakan authMock
export const authMock = {
  requireAuth,
  getCurrentUser,
  requireRole
};

export default authMock;