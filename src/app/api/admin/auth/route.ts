import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function hash(password: string): string {
  return createHash("sha256")
    .update(`saarlaender-weltweit:${password}`)
    .digest("hex");
}

// POST /api/admin/auth – Passwort prüfen
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "admin_password_hash")
    .single();

  const storedHash = data?.value ?? "";

  // Fallback: wenn noch kein Hash in DB, ADMIN_SECRET aus .env verwenden
  if (!storedHash) {
    if (password === process.env.ADMIN_SECRET) {
      // Beim ersten Login Hash in DB speichern
      await admin.from("settings").upsert(
        { key: "admin_password_hash", value: hash(password) },
        { onConflict: "key" }
      );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (hash(password) !== storedHash) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

// PUT /api/admin/auth – Passwort ändern
export async function PUT(req: NextRequest) {
  const { current_password, new_password } = await req.json();

  if (!current_password || !new_password || new_password.length < 8) {
    return NextResponse.json(
      { error: "Neues Passwort muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Aktuelles Passwort prüfen
  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "admin_password_hash")
    .single();

  const storedHash = data?.value ?? "";
  const currentValid =
    storedHash
      ? hash(current_password) === storedHash
      : current_password === process.env.ADMIN_SECRET;

  if (!currentValid) {
    return NextResponse.json({ error: "Aktuelles Passwort falsch." }, { status: 401 });
  }

  await admin.from("settings").upsert(
    { key: "admin_password_hash", value: hash(new_password) },
    { onConflict: "key" }
  );

  return NextResponse.json({ ok: true });
}
