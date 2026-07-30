import { NextRequest, NextResponse } from "next/server";

const LUCY_APP = "decart/lucy-2-5";
const TOKEN_EXPIRATION_SECONDS = 120;

export async function POST(request: NextRequest) {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return NextResponse.json(
      { error: "Set FAL_KEY in apps/world-models-nextjs/.env.local" },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    app?: unknown;
  } | null;
  if (body?.app !== `${LUCY_APP}/realtime`) {
    return NextResponse.json(
      { error: "This demo only grants tokens for Lucy 2.5." },
      { status: 400 },
    );
  }

  const upstream = await fetch("https://rest.fal.ai/tokens/", {
    method: "POST",
    headers: {
      authorization: `Key ${falKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      allowed_apps: [LUCY_APP],
      token_expiration: TOKEN_EXPIRATION_SECONDS,
    }),
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: await upstream.text() },
      { status: upstream.status },
    );
  }

  const payload = (await upstream.json()) as
    | string
    | { detail?: string; token?: string };
  const token =
    typeof payload === "string" ? payload : (payload.detail ?? payload.token);
  if (!token) {
    return NextResponse.json(
      { error: "fal returned an invalid realtime token" },
      { status: 502 },
    );
  }

  return new Response(token, {
    headers: { "content-type": "text/plain" },
  });
}

export const dynamic = "force-dynamic";
