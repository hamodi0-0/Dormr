import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";

  if (name.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const upstream = await fetch(
      `http://universities.hipolabs.com/search?name=${encodeURIComponent(name)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "University search upstream failed" },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to reach university search service" },
      { status: 502 },
    );
  }
}