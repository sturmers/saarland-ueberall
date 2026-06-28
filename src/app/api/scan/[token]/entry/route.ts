import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function fingerprint(req: NextRequest, cardId: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${cardId}:${ip}:${ua}`).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  // Karte per write_token finden
  const { data: card } = await supabase
    .from("cards")
    .select("id")
    .eq("write_token", params.token)
    .single();

  if (!card) {
    return NextResponse.json({ error: "Ungültiger QR-Code" }, { status: 404 });
  }

  const fp = fingerprint(req, card.id);

  // Fingerprint prüfen (service role nötig, da RLS kein öffentliches Lesen erlaubt)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: lock } = await admin
    .from("submission_locks")
    .select("id, created_at")
    .eq("card_id", card.id)
    .eq("fingerprint", fp)
    .maybeSingle();

  if (lock) {
    // Nur erlauben wenn nach dem letzten eigenen Eintrag jemand anderes eingetragen hat
    const { data: newerEntry } = await admin
      .from("entries")
      .select("id")
      .eq("card_id", card.id)
      .gt("created_at", lock.created_at)
      .maybeSingle();

    if (!newerEntry) {
      return NextResponse.json({ error: "already_submitted" }, { status: 409 });
    }
  }

  const body = await req.json();
  const { name, location_name, home_location, lat, lng } = body;

  if (!name?.trim() || !location_name?.trim() || !home_location?.trim()) {
    return NextResponse.json(
      { error: "Name, Heimatort und Fundort sind Pflichtfelder" },
      { status: 400 }
    );
  }

  // Eintrag und Fingerprint in einer Transaktion speichern
  const { data, error } = await admin
    .from("entries")
    .insert({
      card_id: card.id,
      name: name.trim(),
      location_name: location_name.trim(),
      home_location: home_location.trim(),
      lat: lat ?? null,
      lng: lng ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Eintrag konnte nicht gespeichert werden" }, { status: 500 });
  }

  // Fingerprint-Zeitstempel aktualisieren (upsert = neu anlegen oder updated_at erneuern)
  await admin.from("submission_locks").upsert(
    { card_id: card.id, fingerprint: fp, created_at: new Date().toISOString() },
    { onConflict: "card_id,fingerprint" }
  );

  return NextResponse.json({ entry: data }, { status: 201 });
}
