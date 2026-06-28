import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/entries – alle Einträge mit GPS für die Weltkarte
export async function GET() {
  const { data, error } = await supabase
    .from("entries")
    .select("id, card_id, name, location_name, lat, lng, created_at")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
