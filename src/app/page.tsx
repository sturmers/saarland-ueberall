import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function Home() {
  const { data: entries } = await supabase
    .from("entries")
    .select("id, card_id, name, location_name, home_location, comment, lat, lng, created_at")
    .not("lat", "is", null)
    .not("lng", "is", null);

  const { data: settings } = await supabase
    .from("settings")
    .select("key, value");

  const { data: cards } = await supabase
    .from("cards")
    .select("id, card_name, launch_message, created_at");

  const instagram = settings?.find((s) => s.key === "instagram_url")?.value ?? "";

  return <HomeClient entries={entries ?? []} cards={cards ?? []} instagramUrl={instagram} />;
}
