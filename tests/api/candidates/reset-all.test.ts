import { POST } from "@/app/api/voting/reset-all/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

jest.mock("@/lib/auth/session", () => ({
  __esModule: true,
  requireRole: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
  requireAuth: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
}));

describe("POST /api/voting/reset-all", () => {
  beforeEach(() => {
    // Reset mocks to default successful state to prevent leakage
    (prisma.vote.deleteMany as jest.Mock).mockReset();
    (prisma.user.updateMany as jest.Mock).mockReset();
    
    // Default safe implementation
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    
    jest.clearAllMocks();
  });

  test("berhasil reset semua data (Success Path)", async () => {
    // Override with specific success values
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

    const { req } = mockRequestResponse("POST");

    const response = await POST(); 

    expect(response.status).toBe(200);
    expect(prisma.vote.deleteMany).toHaveBeenCalled();
    expect(prisma.user.updateMany).toHaveBeenCalled();
  });

  test("gagal reset sebagian data (Failure Path)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Override with failure
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });
    (prisma.user.updateMany as jest.Mock).mockRejectedValue(new Error("Update Timeout"));

    const { req } = mockRequestResponse("POST");

    const response = await POST(); 

    expect(response.status).toBe(500);
    
    consoleSpy.mockRestore();
  });
});