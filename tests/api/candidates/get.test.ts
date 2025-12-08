import { GET } from "@/app/api/candidates/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

describe("GET /api/candidates", () => {
  test("ambil semua kandidat", async () => {
    (prisma.candidate.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const { req } = mockRequestResponse("GET");
    const response = await GET(req as any);

    expect(response.status).toBe(200);
  });
});