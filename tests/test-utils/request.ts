export function mockRequestResponse(method: string = "GET", body?: any, params?: Record<string, string>) {
  const baseUrl = "http://localhost:3000/api/test";
  const url = new URL(baseUrl);

  // Append query parameters if needed (e.g., ?id=1)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // Create a standard Web Request object (Next.js App Router standard)
  const req = new Request(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: (method !== "GET" && method !== "DELETE" && body) ? JSON.stringify(body) : undefined,
  });

  // For App Router, we don't use 'res'. Returning a dummy to prevent destructuring errors if any.
  return { req, res: {} as any };
}