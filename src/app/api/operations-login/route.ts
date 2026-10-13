import { createHash, timingSafeEqual } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const OPERATIONS_UID = "strata-temporary-operations";

function getAdminApp() {
  const existing = getApps().find(app => app.name === "strata-operations");
  if (existing) return existing;
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("Missing FIREBASE_ADMIN_KEY environment variable.");
  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY must contain valid service-account JSON.");
  }
  const expectedProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (expectedProject && serviceAccount.project_id !== expectedProject) {
    throw new Error("Firebase Admin service account does not match the configured Strata project.");
  }
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) }, "strata-operations");
}

function matchesWord(input: string, expected: string) {
  const inputHash = createHash("sha256").update(input).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return input.length > 0 && timingSafeEqual(inputHash, expectedHash);
}

export async function POST(request: Request) {
  try {
    const expected = process.env.STRATA_OPERATIONS_WORD;
    if (!expected) {
      return NextResponse.json({ error: "Strata Operations sign-in is not configured yet. Add STRATA_OPERATIONS_WORD in the server environment." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const body = await request.json().catch(() => null) as { word?: unknown } | null;
    const word = typeof body?.word === "string" ? body.word : "";
    if (!matchesWord(word, expected)) {
      return NextResponse.json({ error: "Access denied. Check the Operations access word and try again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const app = getAdminApp();
    await getFirestore(app).collection("admins").doc(OPERATIONS_UID).set({
      role: "owner",
      temporaryAccess: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    const token = await getAuth(app).createCustomToken(OPERATIONS_UID);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Strata Operations login failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Operations sign-in is temporarily unavailable. Check the server configuration." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
