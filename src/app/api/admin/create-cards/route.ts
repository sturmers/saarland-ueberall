import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const count = Math.min(Number(body.count) || 1, 200);

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Alle bestehenden IDs und Tokens laden, damit keine Duplikate entstehen
  const { data: existing } = await admin.from("cards").select("id, write_token");
  const existingIds = new Set((existing ?? []).map((c) => c.id));
  const existingTokens = new Set((existing ?? []).map((c) => c.write_token));

  const rows: { id: string; write_token: string }[] = [];

  while (rows.length < count) {
    const id = nanoid(8);
    const write_token = nanoid(16);

    // Sicherstellen dass beide IDs wirklich einzigartig sind
    if (existingIds.has(id) || rows.some((r) => r.id === id)) continue;
    if (existingTokens.has(write_token) || rows.some((r) => r.write_token === write_token)) continue;

    rows.push({ id, write_token });
  }

  const { error } = await admin.from("cards").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://deine-domain.de";

  return NextResponse.json({
    created: count,
    cards: rows.map((r) => ({
      id: r.id,
      view_url: `${baseUrl}/karte/${r.id}`,
      write_url: `${baseUrl}/scan/${r.write_token}`,
      write_token: r.write_token,
    })),
  });
}
