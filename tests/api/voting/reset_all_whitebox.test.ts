import { POST } from "@/app/api/voting/reset-all/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Mock Auth: Only ADMIN allowed
jest.mock("@/lib/auth/session", () => ({
  __esModule: true,
  requireRole: jest.fn().mockResolvedValue({ id: "admin", role: "ADMIN" }),
}));

describe("Whitebox: POST /api/voting/reset-all", () => {
  beforeEach(() => {
    (prisma.vote.deleteMany as jest.Mock).mockReset();
    (prisma.user.updateMany as jest.Mock).mockReset();
    
    // Default safe state
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    
    jest.clearAllMocks();
  });

  test("WB-08: Sequential Execution - Verify Delete THEN Update", async () => {
    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 50 });

    const response = await POST();

    expect(response.status).toBe(200);
    
    expect(prisma.vote.deleteMany).toHaveBeenCalled();
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      data: { hasVotedOsis: false, hasVotedMpk: false }
    });
  });

  test("WB-09: Partial Failure Risk - Delete Success but Update Fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (prisma.vote.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });
    (prisma.user.updateMany as jest.Mock).mockRejectedValue(new Error("Update Timeout"));

    const response = await POST();

    expect(response.status).toBe(500);
    
    consoleSpy.mockRestore();
  });
});