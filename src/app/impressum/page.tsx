import Link from "next/link";
import Logo from "@/components/Logo";

export default function Impressum() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <header className="border-b px-4 py-3" style={{ background: "#fff", borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} color="var(--accent)" />
          <span className="font-semibold text-sm">Saarländer weltweit</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Impressum</h1>

        <div className="prose-sm space-y-6" style={{ color: "var(--text)" }}>
          <section>
            <h2 className="font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Stefan Stürmer<br />
              Schlossplatz<br />
              66793 Saarwellingen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Kontakt</h2>
            <p style={{ color: "var(--text-muted)" }}>
              E-Mail: stefan@stuermer.de
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Stefan Stürmer<br />
              (Anschrift wie oben)
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Haftungsausschluss</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch
              keine Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG
              für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Für die von Nutzern eingetragenen Inhalte (Namen, Ortsangaben) übernehmen wir
              keine Haftung.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Nutzerinhalte</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Nutzer können auf dieser Plattform freiwillig ihren Namen und Standort eintragen.
              Diese Daten werden öffentlich angezeigt. Es liegt in der Verantwortung des Nutzers,
              keine falschen oder personenschutzrelevanten Daten einzutragen.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        <Link href="/" className="underline mr-4">Startseite</Link>
        <Link href="/datenschutz" className="underline">Datenschutz</Link>
      </footer>
    </div>
  );
}
