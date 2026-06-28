import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // can_submit wird client-seitig per localStorage bestimmt
  // Der Server prüft nur beim tatsächlichen Absenden (POST)
  return NextResponse.json({ card, entries: entries ?? [] });
}
