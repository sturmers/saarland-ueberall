import Link from "next/link";
import Logo from "@/components/Logo";

export default function Datenschutz() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <header className="border-b px-4 py-3" style={{ background: "#fff", borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} color="var(--accent)" />
          <span className="font-semibold text-sm">Saarländer weltweit</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Datenschutzerklärung</h1>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist Stefan Stürmer
              (stefan@stuermer.de).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>2. Welche Daten wir erheben</h2>
            <p>
              Wenn du einen QR-Code scannst und dich einträgst, speichern wir folgende Daten:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Dein eingetragener Name</li>
              <li>Dein Heimatort (Freitext)</li>
              <li>Der Ort, an dem du die Karte gefunden hast (Freitext)</li>
              <li>Optional: GPS-Koordinaten (nur wenn du aktiv zustimmst)</li>
              <li>Zeitpunkt des Eintrags</li>
            </ul>
            <p className="mt-2">
              Es werden keine Konten erstellt, keine E-Mail-Adressen erhoben und keine Tracking-Cookies gesetzt.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>3. Zweck der Datenverarbeitung</h2>
            <p>
              Die Daten werden ausschließlich verwendet, um die Reisekette der physischen Karten
              darzustellen und auf der Weltkarte anzuzeigen. Die Einträge sind öffentlich sichtbar.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>4. Rechtsgrundlage</h2>
            <p>
              Die Verarbeitung erfolgt auf Basis deiner freiwilligen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
              durch das aktive Absenden des Formulars.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>5. Speicherort</h2>
            <p>
              Die Daten werden in einer Supabase-Datenbank gespeichert (Server in der EU, Frankfurt).
              Supabase ist DSGVO-konform. Weitere Informationen:{" "}
              <a href="https://supabase.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">
                supabase.com/privacy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>6. Speicherdauer</h2>
            <p>
              Deine Daten werden gespeichert, solange die Website betrieben wird. Du kannst jederzeit
              die Löschung deines Eintrags per E-Mail an stefan@stuermer.de beantragen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>7. Deine Rechte</h2>
            <p>Du hast das Recht auf:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Beschwerde bei der zuständigen Aufsichtsbehörde</li>
            </ul>
            <p className="mt-2">
              Zuständige Aufsichtsbehörde: Unabhängiges Datenschutzzentrum Saarland,
              Fritz-Dobisch-Straße 12, 66111 Saarbrücken.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>8. Missbrauchsschutz</h2>
            <p>
              Um Mehrfach-Einträge auf derselben Karte zu verhindern, wird beim Absenden des Formulars
              ein technischer Fingerabdruck gebildet. Dieser besteht aus einem nicht umkehrbaren
              SHA-256-Hash aus Karten-ID, IP-Adresse und Browser-Kennung. Der Hash wird serverseitig
              gespeichert, die Rohdaten (insbesondere die IP-Adresse) werden zu keinem Zeitpunkt
              gespeichert. Zusätzlich wird im lokalen Speicher deines Browsers (localStorage) ein
              Eintrag gesetzt, der das Formular bei erneutem Aufruf sperrt. Dieser Eintrag verlässt
              deinen Browser nicht und wird nicht an Server übermittelt. Rechtsgrundlage: Art. 6
              Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Integrität der Plattform).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-3" style={{ color: "var(--text)" }}>9. Hosting</h2>
            <p>
              Diese Website wird über Vercel Inc. (San Francisco, USA) gehostet. Vercel verarbeitet
              dabei technisch notwendige Server-Logs (IP-Adresse, Zeitpunkt des Abrufs). Weitere
              Informationen:{" "}
              <a href="https://vercel.com/legal/privacy-policy" className="underline" target="_blank" rel="noopener noreferrer">
                vercel.com/legal/privacy-policy
              </a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <Link href="/" className="underline mr-4">Startseite</Link>
        <Link href="/impressum" className="underline">Impressum</Link>
      </footer>
    </div>
  );
}
