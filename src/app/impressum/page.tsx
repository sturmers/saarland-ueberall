import Link from "next/link";

export default function Impressum() {
  return (
    <div className="min-h-screen" style={{ background: "#fff" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Carry<span style={{ color: "var(--accent)" }}>On</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-12" style={{ letterSpacing: "-0.04em" }}>Impressum</h1>

        <div className="space-y-10" style={{ color: "var(--text)" }}>
          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              AWAH Crafted for Life<br />
              Schlossplatz<br />
              66793 Saarwellingen<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Kontakt
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              E-Mail: stefan@stuermer.de
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              AWAH Crafted for Life<br />
              (Anschrift wie oben)
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Haftungsausschluss
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch
              keine Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG
              für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Für die von Nutzern eingetragenen Inhalte (Namen, Ortsangaben) übernehmen wir
              keine Haftung.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              Nutzerinhalte
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Nutzer können auf dieser Plattform freiwillig ihren Namen und Standort eintragen.
              Diese Daten werden öffentlich angezeigt. Es liegt in der Verantwortung des Nutzers,
              keine falschen oder personenschutzrelevanten Daten einzutragen.
            </p>
          </section>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex gap-8 text-xs" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-60 transition-opacity">Startseite</Link>
          <Link href="/datenschutz" className="hover:opacity-60 transition-opacity">Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
