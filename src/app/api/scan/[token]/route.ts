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

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { data: card, error } = await supabase
    .from("cards")
    .select("id, created_at")
    .eq("write_token", params.token)
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Ungültiger QR-Code" }, { status: 404 });
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("card_id", card.id)
    .order("created_at", { ascending: true });

  // Prüfen ob dieser Nutzer wieder eintragen darf
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fp = fingerprint(req, card.id);
  const { data: lock } = await admin
    .from("submission_locks")
    .select("created_at")
    .eq("card_id", card.id)
    .eq("fingerprint", fp)
    .maybeSingle();

  let can_submit = true;
  if (lock) {
    // Darf wieder eintragen, wenn nach dem letzten eigenen Eintrag noch jemand anderes eingetragen hat
    const newerEntry = (entries ?? []).find(
      (e) => new Date(e.created_at) > new Date(lock.created_at)
    );
    can_submit = !!newerEntry;
  }

  return NextResponse.json({ card, entries: entries ?? [], can_submit });
}
