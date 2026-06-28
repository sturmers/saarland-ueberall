import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: "Karte nicht gefunden" }, { status: 404 });
  }

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("card_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ card, entries: entries ?? [] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.from("cards").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
