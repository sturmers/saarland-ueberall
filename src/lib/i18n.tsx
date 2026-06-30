"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "de" | "en";

const en = {
  // Nav
  nav_worldmap: "World Map",
  nav_how: "How it works",
  nav_stories: "Stories",
  nav_getcard: "Get a card",
  // Hero
  hero_badge: "{n}+ cards in circulation worldwide",
  hero_badge_empty: "Cards in circulation worldwide",
  hero_title_1: "Every card",
  hero_title_2: "has a journey.",
  hero_desc: "Scan. Sign. Pass on. Each CarryOn card travels the world through strangers' hands — leaving a trail you can follow across cities, borders, and continents.",
  hero_track: "Track a card",
  hero_getown: "Get your own card",
  badge_lastseen: "Last seen: {city}",
  badge_stops: "{stops} stops · {countries} countries",
  // Stats
  stat_cards: "Cards in the wild",
  stat_countries: "Countries reached",
  stat_distance: "Total distance",
  stat_stops: "Stops logged",
  // Map section
  map_label: "Live map",
  map_title: "Every stop, on one map.",
  // How it works
  how_label: "How it works",
  how_title_1: "Three simple steps.",
  how_title_2: "Infinite possibilities.",
  step1_title: "Get a card",
  step1_desc: "Each CarryOn card has a unique QR code and serial number. Start your card's journey or find one out in the wild.",
  step2_title: "Scan & sign",
  step2_desc: "Scan the QR code to open the card's living story. Add your name, location, and a personal note for the next finder.",
  step3_title: "Pass it on",
  step3_desc: "Leave the card somewhere for the next traveller — a café, airport lounge, hostel shelf, or the seat of a train.",
  // Dark section
  live_label: "Live stories",
  live_title: "Cards on the move",
  live_viewboard: "View the leaderboard",
  card_stops: "{n} stops",
  last_seen: "Last seen",
  view_journey: "View journey",
  // CTA
  cta_title_1: "Ready to start",
  cta_title_2: "your card's journey?",
  cta_desc: "Order a pack of CarryOn cards and release them into the world. Watch where they go.",
  cta_order: "Order cards",
  cta_explore: "Explore a journey",
  // Footer
  footer_tag: "Every card has a journey. · AWAH Crafted for Life",
  footer_imprint: "Imprint",
  footer_privacy: "Privacy",
  unnamed_card: "Unnamed card",
  // Leaderboard
  lb_label: "Hall of Fame",
  lb_title: "Leaderboard",
  lb_sort_stops: "Stops",
  lb_sort_countries: "Countries",
  lb_sort_distance: "Distance",
  lb_sort_continents: "Continents",
  lb_col_card: "Card",
  lb_from: "From",
  status_active: "Active",
  status_paused: "Paused",
  loading: "Loading…",
  no_cards: "No cards yet.",
  // Card page
  status_transit: "In transit",
  status_resting: "Resting",
  started_in: "Started in {city} · {date}",
  stat_cities: "Cities",
  stat_continents: "Continents",
  stat_distance_short: "Distance",
  timeline_title: "Journey timeline",
  found_by: "Found by",
  from_word: "from",
  later_word: "later",
  current_stop: "Current stop",
  stop_x_of_y: "Stop {x} of {y}",
  scan_hint: "Found this card? Scan its QR code to add a stop.",
  no_stops: "No stops yet — be the first to add one!",
  notfound_title: "Card not found",
  notfound_desc: "The ID „{id}\" doesn't exist.",
  back_map: "← Back to the map",
  // Shop
  shop_coming: "Coming Soon",
  shop_title: "The shop is on its way.",
  shop_desc: "We're putting the finishing touches on ordering your own CarryOn cards. Check back soon.",
  shop_back: "Back to the map",
};

type Dict = typeof en;

const de: Dict = {
  // Nav
  nav_worldmap: "Weltkarte",
  nav_how: "So funktioniert's",
  nav_stories: "Geschichten",
  nav_getcard: "Karte holen",
  // Hero
  hero_badge: "{n}+ Karten weltweit im Umlauf",
  hero_badge_empty: "Karten weltweit im Umlauf",
  hero_title_1: "Jede Karte",
  hero_title_2: "hat eine Reise.",
  hero_desc: "Scannen. Signieren. Weitergeben. Jede CarryOn-Karte reist durch die Hände von Fremden um die Welt — und hinterlässt eine Spur, der du über Städte, Grenzen und Kontinente folgen kannst.",
  hero_track: "Karte verfolgen",
  hero_getown: "Eigene Karte holen",
  badge_lastseen: "Zuletzt gesehen: {city}",
  badge_stops: "{stops} Stationen · {countries} Länder",
  // Stats
  stat_cards: "Karten unterwegs",
  stat_countries: "Länder erreicht",
  stat_distance: "Gesamtstrecke",
  stat_stops: "Stationen erfasst",
  // Map section
  map_label: "Live-Karte",
  map_title: "Jede Station, auf einer Karte.",
  // How it works
  how_label: "So funktioniert's",
  how_title_1: "Drei einfache Schritte.",
  how_title_2: "Unendliche Möglichkeiten.",
  step1_title: "Karte holen",
  step1_desc: "Jede CarryOn-Karte hat einen einzigartigen QR-Code und eine Seriennummer. Starte die Reise deiner Karte oder finde eine in freier Wildbahn.",
  step2_title: "Scannen & signieren",
  step2_desc: "Scanne den QR-Code, um die lebendige Geschichte der Karte zu öffnen. Füge deinen Namen, deinen Ort und eine persönliche Nachricht für den nächsten Finder hinzu.",
  step3_title: "Weitergeben",
  step3_desc: "Lass die Karte für den nächsten Reisenden zurück — in einem Café, einer Flughafen-Lounge, einem Hostel-Regal oder auf einem Zugsitz.",
  // Dark section
  live_label: "Live-Geschichten",
  live_title: "Karten unterwegs",
  live_viewboard: "Zur Bestenliste",
  card_stops: "{n} Stationen",
  last_seen: "Zuletzt gesehen",
  view_journey: "Reise ansehen",
  // CTA
  cta_title_1: "Bereit, die Reise",
  cta_title_2: "deiner Karte zu starten?",
  cta_desc: "Bestelle ein Set CarryOn-Karten und schicke sie in die Welt. Sieh zu, wohin sie reisen.",
  cta_order: "Karten bestellen",
  cta_explore: "Eine Reise entdecken",
  // Footer
  footer_tag: "Jede Karte hat eine Reise. · AWAH Crafted for Life",
  footer_imprint: "Impressum",
  footer_privacy: "Datenschutz",
  unnamed_card: "Unbenannte Karte",
  // Leaderboard
  lb_label: "Ruhmeshalle",
  lb_title: "Bestenliste",
  lb_sort_stops: "Stationen",
  lb_sort_countries: "Länder",
  lb_sort_distance: "Strecke",
  lb_sort_continents: "Kontinente",
  lb_col_card: "Karte",
  lb_from: "Von",
  status_active: "Aktiv",
  status_paused: "Pausiert",
  loading: "Lädt…",
  no_cards: "Noch keine Karten.",
  // Card page
  status_transit: "Unterwegs",
  status_resting: "Pausiert",
  started_in: "Gestartet in {city} · {date}",
  stat_cities: "Städte",
  stat_continents: "Kontinente",
  stat_distance_short: "Strecke",
  timeline_title: "Reiseverlauf",
  found_by: "Gefunden von",
  from_word: "aus",
  later_word: "später",
  current_stop: "Aktuelle Station",
  stop_x_of_y: "Station {x} von {y}",
  scan_hint: "Diese Karte gefunden? Scanne den QR-Code, um eine Station hinzuzufügen.",
  no_stops: "Noch keine Stationen — sei der oder die Erste!",
  notfound_title: "Karte nicht gefunden",
  notfound_desc: "Die ID „{id}\" existiert nicht.",
  back_map: "← Zurück zur Karte",
  // Shop
  shop_coming: "Demnächst",
  shop_title: "Der Shop ist in Arbeit.",
  shop_desc: "Wir legen gerade die letzten Hand an, damit du bald deine eigenen CarryOn-Karten bestellen kannst. Schau bald wieder vorbei.",
  shop_back: "Zurück zur Karte",
};

const dicts: Record<Lang, Dict> = { en, de };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict; locale: string };

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: en, locale: "en-US" });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "de") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: dicts[lang], locale: lang === "de" ? "de-DE" : "en-US" }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Replace {key} placeholders in a template string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
