import { createClient } from "@supabase/supabase-js";

export type Card = {
  id: string;
  created_at: string;
};

export type Entry = {
  id: string;
  card_id: string;
  name: string;
  location_name: string;  // Fundort (wo wurde die Karte gefunden)
  home_location: string;
  comment: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
