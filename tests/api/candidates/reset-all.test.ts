import { POST } from "@/app/api/voting/reset-all/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Explicitly mock the session module (Simplified to match other working tests)
jest.mock("@/lib/auth/session", () => ({
  requireRole: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
  requireAuth: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
}));

describe("POST /api/voting/reset-all", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("berhasil reset semua data", async () => {
    // Mock prisma responses
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

    const { req } = mockRequestResponse("POST");

    // Call the handler directly
    const response = await POST(); 

    expect(response.status).toBe(200);
  });
});