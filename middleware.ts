// middleware.ts
import { NextResponse } from "next/server";

const SECRET = process.env.TOKEN_SECRET!;
const ADMIN_CODE = process.env.ADMIN_CODE || "dreem2025"; // à mettre dans ton .env
const encoder = new TextEncoder();

// Routes spécifiques à ton app "conseiller du droit du travail"
const EXPIRED_ROUTE = "/expired";               // ou "/acces-expire" si tu crées cette page
const ADMIN_BASE_ROUTE = "/admin-panel";        // ex: "/admin-droit-travail"
const ADMIN_LOGIN_ROUTE = `${ADMIN_BASE_ROUTE}/login`;

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

  // Token expiré ou timestamp invalide
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

  // 1. Laisser passer la page d'accès expiré (sinon boucle)
  if (pathname.startsWith(EXPIRED_ROUTE)) {
    return NextResponse.next();
  }

  // 2. Protéger l'admin du conseiller en droit du travail
  if (pathname.startsWith(ADMIN_BASE_ROUTE)) {
    // laisser passer la page de login admin
    if (pathname.startsWith(ADMIN_LOGIN_ROUTE)) {
      return NextResponse.next();
    }

    // vérifier le cookie admin
    const cookies = (req.headers.get("cookie") || "")
      .split(";")
      .map((c) => c.trim());

    const hasValidCookie = cookies.some(
      (c) => c === `admin_code=${ADMIN_CODE}`
    );

    if (!hasValidCookie) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, req.url));
    }

    return NextResponse.next();
  }

  // 3. Laisser passer toutes les API (chat IA, génération de lien, etc.)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 4. Laisser passer les assets Next (build, favicon, etc.)
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // 5. Tout le reste = protégé par un lien temporaire (token)
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL(EXPIRED_ROUTE, req.url));
  }

  const ok = await verifyToken(token);
  if (!ok) {
    return NextResponse.redirect(new URL(EXPIRED_ROUTE, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
