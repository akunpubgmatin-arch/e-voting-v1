import { POST } from "@/app/api/candidates/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Explicitly mock the session module
jest.mock("@/lib/auth/session", () => ({
  requireRole: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
  requireAuth: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
}));

describe("POST /api/candidates", () => {
  beforeEach(() => jest.clearAllMocks());

  test("berhasil tambah kandidat", async () => {
    (prisma.candidate.create as jest.Mock).mockResolvedValue({ id: 1, name: "Calon Baru" });

    const { req } = mockRequestResponse("POST", {
      chairmanName: "Ketua",
      viceChairmanName: "Wakil",
      type: "OSIS",
      periodeId: "p1"
    });

    const response = await POST(req as any);
    expect(response.status).toBe(201);
  });
});