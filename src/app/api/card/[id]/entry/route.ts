import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: card } = await supabase
    .from("cards")
    .select("id")
    .eq("id", id)
    .single();

  if (!card) {
    return NextResponse.json({ error: "Karte nicht gefunden" }, { status: 404 });
  }

  const body = await req.json();
  const { name, location_name, home_location, lat, lng } = body;

  if (!name?.trim() || !location_name?.trim() || !home_location?.trim()) {
    return NextResponse.json(
      { error: "Name, Heimatort und Fundort sind Pflichtfelder" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      card_id: id,
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

  return NextResponse.json({ entry: data }, { status: 201 });
}
