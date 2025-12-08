import { GET } from "@/app/api/voting/status/route";
import { mockRequestResponse } from "@/tests/test-utils/request";
import prisma from "@/lib/prisma";

// Explicitly mock the session module
jest.mock("@/lib/auth/session", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 10,
    role: "USER",
    hasVotedOsis: true,
    hasVotedMpk: false,
  }),
}));

describe("GET /api/voting/status", () => {
  test("kembalikan status voting user", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue({
      id: "p1",
      name: "Periode 2024",
      isActive: true,
      startTime: new Date(Date.now() - 10000),
      endTime: new Date(Date.now() + 10000),
      candidates: []
    });

    const response = await GET(); 
    
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.userStatus.hasVotedOsis).toBe(true);
  });
});