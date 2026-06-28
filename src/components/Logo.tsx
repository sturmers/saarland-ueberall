type Props = {
  size?: number;
  color?: string;
  className?: string;
};

// Vereinfachter SVG-Umriss des Saarlandes – austauschbar
// Um das Logo zu ersetzen: diese Datei bearbeiten oder die src/assets/logo.svg einbinden
export default function Logo({ size = 40, color = "currentColor", className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Saarland"
    >
      {/* Umriss Saarland – vereinfachte Form */}
      <path
        d="
          M 45 8
          C 52 7, 62 10, 70 14
          C 78 18, 83 22, 86 28
          C 89 34, 88 40, 85 46
          C 82 52, 80 54, 82 60
          C 84 66, 83 72, 78 78
          C 73 84, 66 88, 58 90
          C 50 92, 42 90, 36 86
          C 30 82, 26 76, 22 70
          C 18 64, 16 58, 15 51
          C 14 44, 15 38, 18 32
          C 21 26, 26 20, 32 15
          C 38 10, 42 9, 45 8
          Z
        "
        fill={color}
        opacity="0.15"
      />
      <path
        d="
          M 45 8
          C 52 7, 62 10, 70 14
          C 78 18, 83 22, 86 28
          C 89 34, 88 40, 85 46
          C 82 52, 80 54, 82 60
          C 84 66, 83 72, 78 78
          C 73 84, 66 88, 58 90
          C 50 92, 42 90, 36 86
          C 30 82, 26 76, 22 70
          C 18 64, 16 58, 15 51
          C 14 44, 15 38, 18 32
          C 21 26, 26 20, 32 15
          C 38 10, 42 9, 45 8
          Z
        "
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Saar-Fluss als stilisierte Linie */}
      <path
        d="M 38 30 C 42 40, 44 50, 48 62 C 50 68, 52 74, 50 82"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
