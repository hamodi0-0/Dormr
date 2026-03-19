import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPSTREAM_URL = "http://universities.hipolabs.com/search";
const REQUEST_TIMEOUT_MS = 5000;
const MAX_ATTEMPTS = 2;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json([]);
  }

  const upstreamRequestUrl = `${UPSTREAM_URL}?name=${encodeURIComponent(name)}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const upstream = await fetchWithTimeout(
        upstreamRequestUrl,
        REQUEST_TIMEOUT_MS,
      );

      if (!upstream.ok) {
        const isRetriable = upstream.status >= 500 && attempt < MAX_ATTEMPTS;
        if (isRetriable) {
          await wait(200 * attempt);
          continue;
        }

        return NextResponse.json(
          { error: "University search upstream failed" },
          { status: 502 },
        );
      }

      const data = await upstream.json();
      return NextResponse.json(data);
    } catch {
      const canRetry = attempt < MAX_ATTEMPTS;
      if (canRetry) {
        await wait(200 * attempt);
        continue;
      }

      return NextResponse.json(
        { error: "Unable to reach university search service" },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(
    { error: "University search service unavailable" },
    { status: 502 },
  );
}
