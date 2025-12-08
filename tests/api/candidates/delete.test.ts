import { DELETE } from "@/app/api/candidates/[id]/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

// Explicitly mock the session module
jest.mock("@/lib/auth/session", () => ({
  requireRole: jest.fn().mockResolvedValue({ id: "admin-id", role: "ADMIN" }),
}));

describe("DELETE /api/candidates/:id", () => {
  test("berhasil hapus kandidat", async () => {
    (prisma.candidate.delete as jest.Mock).mockResolvedValue({ id: 1 });

    const { req } = mockRequestResponse("DELETE");
    
    const response = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });

    expect(response.status).toBe(200);
  });
});