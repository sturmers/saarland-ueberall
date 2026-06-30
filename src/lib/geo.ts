// Lightweight country → ISO2 + continent lookup, used to render flags and
// continent counts on the leaderboard. Keys are lowercased English and common
// German country names. Unknowns fall back gracefully (no flag, not counted).

type Info = { iso2: string; continent: string };

const COUNTRIES: Record<string, Info> = {
  // Europe
  "germany": { iso2: "DE", continent: "Europe" },
  "deutschland": { iso2: "DE", continent: "Europe" },
  "austria": { iso2: "AT", continent: "Europe" },
  "österreich": { iso2: "AT", continent: "Europe" },
  "switzerland": { iso2: "CH", continent: "Europe" },
  "schweiz": { iso2: "CH", continent: "Europe" },
  "france": { iso2: "FR", continent: "Europe" },
  "frankreich": { iso2: "FR", continent: "Europe" },
  "spain": { iso2: "ES", continent: "Europe" },
  "spanien": { iso2: "ES", continent: "Europe" },
  "italy": { iso2: "IT", continent: "Europe" },
  "italien": { iso2: "IT", continent: "Europe" },
  "portugal": { iso2: "PT", continent: "Europe" },
  "netherlands": { iso2: "NL", continent: "Europe" },
  "niederlande": { iso2: "NL", continent: "Europe" },
  "belgium": { iso2: "BE", continent: "Europe" },
  "belgien": { iso2: "BE", continent: "Europe" },
  "united kingdom": { iso2: "GB", continent: "Europe" },
  "great britain": { iso2: "GB", continent: "Europe" },
  "england": { iso2: "GB", continent: "Europe" },
  "ireland": { iso2: "IE", continent: "Europe" },
  "irland": { iso2: "IE", continent: "Europe" },
  "denmark": { iso2: "DK", continent: "Europe" },
  "dänemark": { iso2: "DK", continent: "Europe" },
  "sweden": { iso2: "SE", continent: "Europe" },
  "schweden": { iso2: "SE", continent: "Europe" },
  "norway": { iso2: "NO", continent: "Europe" },
  "norwegen": { iso2: "NO", continent: "Europe" },
  "finland": { iso2: "FI", continent: "Europe" },
  "finnland": { iso2: "FI", continent: "Europe" },
  "iceland": { iso2: "IS", continent: "Europe" },
  "island": { iso2: "IS", continent: "Europe" },
  "poland": { iso2: "PL", continent: "Europe" },
  "polen": { iso2: "PL", continent: "Europe" },
  "czech republic": { iso2: "CZ", continent: "Europe" },
  "czechia": { iso2: "CZ", continent: "Europe" },
  "tschechien": { iso2: "CZ", continent: "Europe" },
  "austria ": { iso2: "AT", continent: "Europe" },
  "hungary": { iso2: "HU", continent: "Europe" },
  "ungarn": { iso2: "HU", continent: "Europe" },
  "greece": { iso2: "GR", continent: "Europe" },
  "griechenland": { iso2: "GR", continent: "Europe" },
  "croatia": { iso2: "HR", continent: "Europe" },
  "kroatien": { iso2: "HR", continent: "Europe" },
  "russia": { iso2: "RU", continent: "Europe" },
  "russland": { iso2: "RU", continent: "Europe" },
  "ukraine": { iso2: "UA", continent: "Europe" },
  "romania": { iso2: "RO", continent: "Europe" },
  "rumänien": { iso2: "RO", continent: "Europe" },
  "luxembourg": { iso2: "LU", continent: "Europe" },
  "luxemburg": { iso2: "LU", continent: "Europe" },
  // Americas
  "united states": { iso2: "US", continent: "North America" },
  "usa": { iso2: "US", continent: "North America" },
  "united states of america": { iso2: "US", continent: "North America" },
  "vereinigte staaten": { iso2: "US", continent: "North America" },
  "canada": { iso2: "CA", continent: "North America" },
  "kanada": { iso2: "CA", continent: "North America" },
  "mexico": { iso2: "MX", continent: "North America" },
  "mexiko": { iso2: "MX", continent: "North America" },
  "brazil": { iso2: "BR", continent: "South America" },
  "brasilien": { iso2: "BR", continent: "South America" },
  "argentina": { iso2: "AR", continent: "South America" },
  "argentinien": { iso2: "AR", continent: "South America" },
  "chile": { iso2: "CL", continent: "South America" },
  "peru": { iso2: "PE", continent: "South America" },
  "colombia": { iso2: "CO", continent: "South America" },
  "kolumbien": { iso2: "CO", continent: "South America" },
  "uruguay": { iso2: "UY", continent: "South America" },
  // Asia
  "china": { iso2: "CN", continent: "Asia" },
  "japan": { iso2: "JP", continent: "Asia" },
  "india": { iso2: "IN", continent: "Asia" },
  "indien": { iso2: "IN", continent: "Asia" },
  "thailand": { iso2: "TH", continent: "Asia" },
  "vietnam": { iso2: "VN", continent: "Asia" },
  "indonesia": { iso2: "ID", continent: "Asia" },
  "indonesien": { iso2: "ID", continent: "Asia" },
  "south korea": { iso2: "KR", continent: "Asia" },
  "südkorea": { iso2: "KR", continent: "Asia" },
  "singapore": { iso2: "SG", continent: "Asia" },
  "singapur": { iso2: "SG", continent: "Asia" },
  "turkey": { iso2: "TR", continent: "Asia" },
  "türkei": { iso2: "TR", continent: "Asia" },
  "united arab emirates": { iso2: "AE", continent: "Asia" },
  "vereinigte arabische emirate": { iso2: "AE", continent: "Asia" },
  "israel": { iso2: "IL", continent: "Asia" },
  "mongolia": { iso2: "MN", continent: "Asia" },
  "mongolei": { iso2: "MN", continent: "Asia" },
  "philippines": { iso2: "PH", continent: "Asia" },
  "philippinen": { iso2: "PH", continent: "Asia" },
  // Africa
  "south africa": { iso2: "ZA", continent: "Africa" },
  "südafrika": { iso2: "ZA", continent: "Africa" },
  "morocco": { iso2: "MA", continent: "Africa" },
  "marokko": { iso2: "MA", continent: "Africa" },
  "egypt": { iso2: "EG", continent: "Africa" },
  "ägypten": { iso2: "EG", continent: "Africa" },
  "kenya": { iso2: "KE", continent: "Africa" },
  "kenia": { iso2: "KE", continent: "Africa" },
  "tunisia": { iso2: "TN", continent: "Africa" },
  "tunesien": { iso2: "TN", continent: "Africa" },
  "algeria": { iso2: "DZ", continent: "Africa" },
  "algerien": { iso2: "DZ", continent: "Africa" },
  "nigeria": { iso2: "NG", continent: "Africa" },
  "tanzania": { iso2: "TZ", continent: "Africa" },
  "tansania": { iso2: "TZ", continent: "Africa" },
  // Oceania
  "australia": { iso2: "AU", continent: "Oceania" },
  "australien": { iso2: "AU", continent: "Oceania" },
  "new zealand": { iso2: "NZ", continent: "Oceania" },
  "neuseeland": { iso2: "NZ", continent: "Oceania" },
};

function lookup(country: string): Info | null {
  return COUNTRIES[country.trim().toLowerCase()] ?? null;
}

/** Country name (e.g. "Spain") → flag emoji, or "" if unknown. */
export function countryFlag(country: string): string {
  const info = lookup(country);
  if (!info) return "";
  return info.iso2
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Country name → continent name, or null if unknown. */
export function countryContinent(country: string): string | null {
  return lookup(country)?.continent ?? null;
}

/** "Barcelona, Spain" → "Barcelona". */
export function cityOf(locationName: string): string {
  return (locationName ?? "").split(",")[0].trim();
}

/** "Barcelona, Spain" → "Spain". */
export function countryOf(locationName: string): string {
  const parts = (locationName ?? "").split(",");
  return parts[parts.length - 1].trim();
}
