import { NextResponse } from "next/server";

const SECRET = process.env.TOKEN_SECRET!;
const ADMIN_CODE = "dreem2025";
const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [tsStr, signature] = parts;
  const expiresAt = Number(tsStr);

  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(tsStr));
  const expectedSig = toBase64Url(signed);

  return expectedSig === signature;
}

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. laisser passer /expired (sinon boucle)
  if (pathname.startsWith("/expired")) {
    return NextResponse.next();
  }

  // 2. protéger /admin-panel
  if (pathname.startsWith("/admin-panel")) {
    // laisser passer la page de login
    if (pathname.startsWith("/admin-panel/login")) {
      return NextResponse.next();
    }

    // vérifier le cookie
    const cookies = (req.headers.get("cookie") || "")
      .split(";")
      .map((c) => c.trim());

    const hasValidCookie = cookies.some(
      (c) => c === `admin_code=${ADMIN_CODE}`
    );

    if (!hasValidCookie) {
      return NextResponse.redirect(new URL("/admin-panel/login", req.url));
    }

    return NextResponse.next();
  }

  // 3. laisser passer toutes les API (chatkit, generate-link, etc.)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 4. laisser passer les assets Next
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // 5. tout le reste → protégé par ton lien temporaire
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/expired", req.url));
  }

  const ok = await verifyToken(token);
  if (!ok) {
    return NextResponse.redirect(new URL("/expired", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
