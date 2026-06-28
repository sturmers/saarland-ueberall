import Link from "next/link";
import Logo from "./Logo";

type Props = {
  instagramUrl?: string;
};

export default function Nav({ instagramUrl }: Props) {
  return (
    <header className="border-b" style={{ background: "var(--cream)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo size={34} color="var(--accent)" />
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: "var(--text)" }}>
              Saarländer
            </p>
            <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>
              weltweit
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Weltkarte
          </Link>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Instagram
            </a>
          )}
          <Link
            href="/impressum"
            className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Impressum
          </Link>
        </nav>
      </div>
    </header>
  );
}
