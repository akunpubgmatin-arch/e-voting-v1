import { POST } from "@/app/api/voting/vote/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Variable to hold the mock implementation so we can change it per test
let mockUser = {
  id: "user-10",
  role: "USER",
  hasVotedOsis: false,
  hasVotedMpk: false,
};

// Explicitly mock the session module
jest.mock("@/lib/auth/session", () => ({
  requireAuth: jest.fn(async () => mockUser),
}));

describe("POST /api/voting/vote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock user default state
    mockUser = {
      id: "user-10",
      role: "USER",
      hasVotedOsis: false,
      hasVotedMpk: false,
    };
  });

  test("berhasil vote", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue({
      id: "p1",
      isActive: true,
      startTime: null,
      endTime: null,
    });
    
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue({
      id: "c1",
      periodeId: "p1",
      type: "OSIS",
    });
    
    (prisma.$transaction as jest.Mock).mockResolvedValue({});

    const { req } = mockRequestResponse("POST", {
      candidateId: "c1",
      type: "OSIS",
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  test("gagal vote — user sudah vote", async () => {
    // Update mock user state for this test
    mockUser = { ...mockUser, hasVotedOsis: true };

    const { req } = mockRequestResponse("POST", {
      candidateId: "c1",
      type: "OSIS",
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  test("gagal vote — kandidat tidak ditemukan", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue({
      id: "p1",
      isActive: true,
    });
    
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

    const { req } = mockRequestResponse("POST", {
      candidateId: "c1",
      type: "OSIS",
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});