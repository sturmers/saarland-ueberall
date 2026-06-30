import Link from "next/link";

type Props = {
  instagramUrl?: string;
};

export default function Nav({ instagramUrl }: Props) {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
            Carry<span style={{ color: "var(--accent)" }}>On</span>
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/" className="text-sm font-medium transition-colors hover:opacity-60" style={{ color: "var(--text-muted)" }}>
            World Map
          </Link>
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:opacity-60" style={{ color: "var(--text-muted)" }}>
              Instagram
            </a>
          )}
          <Link href="/impressum" className="text-sm font-medium transition-colors hover:opacity-60" style={{ color: "var(--text-muted)" }}>
            Impressum
          </Link>
        </nav>
      </div>
    </header>
  );
}
