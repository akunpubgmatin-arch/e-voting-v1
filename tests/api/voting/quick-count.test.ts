import { GET } from "@/app/api/voting/quick-count/route";
import prisma from "@/lib/prisma";
import { mockRequestResponse } from "@/tests/test-utils/request";

describe("GET /api/voting/quick-count", () => {
  test("kembalikan quick count", async () => {
    (prisma.periode.findFirst as jest.Mock).mockResolvedValue({ id: "periode-1", isActive: true });
    (prisma.user.count as jest.Mock).mockResolvedValue(100);
    
    (prisma.candidate.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: "A", type: "OSIS", _count: { votes: 10 }, votes: [] },
      { id: 2, name: "B", type: "OSIS", _count: { votes: 5 }, votes: [] },
    ]);

    const { req } = mockRequestResponse("GET");
    
    const response = await GET(req as any);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.totalVoters).toBe(100);
    expect(data.osisResults).toHaveLength(2);
  });
});