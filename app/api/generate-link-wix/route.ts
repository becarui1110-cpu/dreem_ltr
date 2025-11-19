export const runtime = "edge";

const encoder = new TextEncoder();

/** Convertit ArrayBuffer → base64url */
function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Génère le token signé */
async function makeToken(secret: string, minutes: number) {
  const expiresAt = Date.now() + minutes * 60 * 1000;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(String(expiresAt)));
  const signature = toBase64Url(sigBuf);

  return `${expiresAt}.${signature}`;
}

/** === POST handler : génère le lien sécurisé === */
export async function POST(req: Request) {
  const tokenSecret = process.env.TOKEN_SECRET;
  const siteUrl = (process.env.SITE_URL || "https://standard.mycaradvisor.ch").replace(/\/$/, "");

  if (!tokenSecret) {
    return new Response(JSON.stringify({ error: "TOKEN_SECRET missing in Vercel" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let durationMinutes = 720; // ⏱️ 12h par défaut
  try {
    const body = (await req.json()) as { duration?: number | string };
    if (body.duration) {
      const val = Number(body.duration);
      if (!Number.isNaN(val) && val > 0) durationMinutes = val;
    }
  } catch {
    // pas grave, on garde 720 par défaut
  }

  const token = await makeToken(tokenSecret, durationMinutes);
  const link = `${siteUrl}/?token=${encodeURIComponent(token)}`;

  return new Response(JSON.stringify({ link }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/** === GET (info) === */
export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Use POST with JSON body: { "duration": 720 }',
    }),
    { status: 405, headers: { "content-type": "application/json" } }
  );
}
