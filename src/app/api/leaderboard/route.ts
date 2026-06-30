import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET() {
  const { data: cards } = await supabase
    .from("cards")
    .select("id, card_name, launch_message, created_at");

  const { data: entries } = await supabase
    .from("entries")
    .select("id, card_id, name, location_name, lat, lng, created_at")
    .order("created_at", { ascending: true });

  return NextResponse.json({ cards: cards ?? [], entries: entries ?? [] });
}
