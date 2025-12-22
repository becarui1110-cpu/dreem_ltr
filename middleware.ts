// middleware.ts
import { NextResponse } from "next/server";

const SECRET = process.env.TOKEN_SECRET!;
const ADMIN_CODE = process.env.ADMIN_CODE || "dreem2025";
const encoder = new TextEncoder();

// Routes spécifiques
const EXPIRED_ROUTE = "/expired";
const ADMIN_BASE_ROUTE = "/admin-panel";
const ADMIN_LOGIN_ROUTE = `${ADMIN_BASE_ROUTE}/login`;

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [tsStr, signature] = parts;
  const expiresAt = Number(tsStr);

  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

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

  // 0) ✅ Laisser passer les assets publics (favicon + images + fichiers statiques)
  // IMPORTANT: sinon ils sont redirigés vers /expired
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/public/") || // (au cas où, mais généralement inutile)
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|woff|woff2|ttf)$/i.test(
      pathname
    )
  ) {
    return NextResponse.next();
  }

  // 1) Laisser passer la page d'accès expiré (sinon boucle)
  if (pathname.startsWith(EXPIRED_ROUTE)) {
    return NextResponse.next();
  }

  // 2) Protéger l'admin
  if (pathname.startsWith(ADMIN_BASE_ROUTE)) {
    // laisser passer la page de login admin
    if (pathname.startsWith(ADMIN_LOGIN_ROUTE)) {
      return NextResponse.next();
    }

    // vérifier le cookie admin
    const cookies = (req.headers.get("cookie") || "")
      .split(";")
      .map((c) => c.trim());

    const hasValidCookie = cookies.some((c) => c === `admin_code=${ADMIN_CODE}`);

    if (!hasValidCookie) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_ROUTE, req.url));
    }

    return NextResponse.next();
  }

  // 3) Laisser passer toutes les API
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 4) Laisser passer les assets Next
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 5) Tout le reste = protégé par token
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
