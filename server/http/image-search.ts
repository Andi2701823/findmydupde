import "server-only";
export async function handleImageSearch(request: Request) {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  const length = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(length) || length < 0 || length > 5 * 1024 * 1024)
    return Response.json(
      { error: "IMAGE_TOO_LARGE" },
      { status: 413, headers },
    );
  // Intentionally do not read/store the body or call OpenAI. This is a disabled integration boundary.
  if (process.env.IMAGE_SEARCH_ENABLED !== "true")
    return Response.json(
      {
        error: "IMAGE_SEARCH_DISABLED",
        message: "Die Bildanalyse ist noch nicht aktiviert.",
      },
      { status: 503, headers },
    );
  return Response.json(
    {
      error: "IMAGE_SEARCH_NOT_IMPLEMENTED",
      message: "Die Bildanalyse ist noch nicht implementiert.",
    },
    { status: 501, headers },
  );
}
