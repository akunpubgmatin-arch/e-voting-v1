import { POST } from "@/app/api/voting/vote/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Variable mutable untuk manipulasi state user di dalam mock
let mockUser = {
  id: "user-1",
  role: "USER",
  hasVotedOsis: false,
  hasVotedMpk: false,
};

// Mock Auth Module Explicitly
jest.mock("@/lib/auth/session", () => ({
  requireAuth: jest.fn(async () => mockUser),
}));

describe("Whitebox: POST /api/voting/vote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: "user-1", role: "USER", hasVotedOsis: false, hasVotedMpk: false };
    
    // Freeze Time: Set waktu ke 2025-01-15 (Valid Window)
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validPeriode = {
    id: "p1",
    isActive: true,
    startTime: new Date("2025-01-01T00:00:00Z"),
    endTime: new Date("2025-01-31T23:59:59Z"),
  };

  const validCandidate = {
    id: "c1",
    periodeId: "p1",
    type: "OSIS",
  };

  // --- SUCCESS PATHS ---
  
  test("WB-01: Success Vote OSIS - Transaction Executed Atomically", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode);
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(validCandidate);
    (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]); // Return dummy result

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(200);
    
    expect(prisma.$transaction).toHaveBeenCalled();
    const calls = (prisma.$transaction as jest.Mock).mock.calls[0][0];
    expect(calls).toHaveLength(2); 
  });

  // --- LOGIC BRANCH / FAILURE PATHS ---

  test("WB-02: Branch 'Double Vote' - User already voted OSIS", async () => {
    mockUser.hasVotedOsis = true; 
    
    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/sudah memilih/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test("WB-03: Branch 'Time Window' - Voting before startTime (Early)", async () => {
    jest.setSystemTime(new Date("2024-12-31T23:59:59Z")); 
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode);

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/belum dimulai/i);
  });

  test("WB-04: Branch 'Time Window' - Voting after endTime (Late)", async () => {
    jest.setSystemTime(new Date("2025-02-01T00:00:01Z")); 
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode);

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/sudah berakhir/i);
  });

  test("WB-05: Branch 'Data Integrity' - Candidate Periode Mismatch", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode); 
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue({
      ...validCandidate,
      periodeId: "p2_other", 
    });

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/tidak valid/i);
  });

  test("WB-06: Branch 'Data Integrity' - Candidate Type Mismatch", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode);
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue({
      ...validCandidate,
      type: "MPK", 
    });

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" }); 
    const res = await POST(req as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toMatch(/tidak sesuai/i);
  });

  test("WB-07: Branch 'Transaction Fail' - DB Error Handling", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error log

    (prisma.periode.findFirst as jest.Mock).mockResolvedValue(validPeriode);
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(validCandidate);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB Deadlock"));

    const { req } = mockRequestResponse("POST", { candidateId: "c1", type: "OSIS" });
    const res = await POST(req as any);

    expect(res.status).toBe(500);
    
    consoleSpy.mockRestore(); // Restore
  });
});