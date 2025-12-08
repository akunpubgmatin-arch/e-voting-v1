import { POST } from "@/app/api/voting/reset-all/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Explicitly mock the session module with a factory function that returns the mock
jest.mock("@/lib/auth/session", () => ({
  __esModule: true,
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

    // Ensure mockRequestResponse creates a valid request if needed, 
    // although this specific route might not use the request body.
    const { req } = mockRequestResponse("POST");

    const response = await POST(); 

    // Debugging info if it fails again
    if (response.status !== 200) {
      console.log("Response body:", await response.json());
    }

    expect(response.status).toBe(200);
  });
});