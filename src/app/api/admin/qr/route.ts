import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// GET /api/admin/qr?token=WRITE_TOKEN&format=svg|png
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const format = req.nextUrl.searchParams.get("format") ?? "png";

  if (!token) return NextResponse.json({ error: "token fehlt" }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://deine-domain.de";
  const url = `${baseUrl}/scan/${token}`;

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: "#1e3a5f", light: "#ffffff" },
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="karte-${token}.svg"`,
      },
    });
  }

  const dataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  return NextResponse.json({ token, url, qr: dataUrl });
}
