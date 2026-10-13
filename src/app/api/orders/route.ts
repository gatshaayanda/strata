import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type DocumentData } from "firebase-admin/firestore";

export const runtime = "nodejs";

type Branch = "Gaborone" | "Francistown";
type SubmittedItem = { menuItemId: string; quantity: number };

function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("ORDER_SERVICE_NOT_CONFIGURED");
  let serviceAccount: Record<string, unknown>;
  try { serviceAccount = JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new Error("ORDER_SERVICE_CREDENTIALS_INVALID"); }
  const targetProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!targetProject || process.env.FIREBASE_PROJECT_ID !== targetProject || serviceAccount.project_id !== targetProject) throw new Error("ORDER_SERVICE_PROJECT_MISMATCH");
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]), projectId: targetProject });
}

function validText(value: unknown, max: number, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || Boolean(value.trim()));
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return NextResponse.json({ error: "Your order session could not be verified. Please retry." }, { status: 401 });

    const app = adminApp();
    const decoded = await getAuth(app).verifyIdToken(token);
    const body = await request.json() as Record<string, unknown>;
    const orderId = body.orderId;
    const branch = body.branch;
    const customerName = body.customerName;
    const phone = body.phone;
    const mode = body.mode;
    const deliveryLocation = body.deliveryLocation;
    const instructions = body.instructions;
    const scheduledFor = body.scheduledFor;
    const items = body.items;

    if (!validText(orderId, 128, true) || !/^[A-Za-z0-9_-]{10,128}$/.test(orderId)) {
      return NextResponse.json({ error: "The order reference is invalid. Please retry." }, { status: 400 });
    }
    if (branch !== "Gaborone" && branch !== "Francistown") return NextResponse.json({ error: "Choose Gaborone or Francistown." }, { status: 400 });
    if (!validText(customerName, 120, true) || !validText(phone, 60, true)) return NextResponse.json({ error: "Add your name and contact number." }, { status: 400 });
    if (mode !== "pickup" && mode !== "delivery") return NextResponse.json({ error: "Choose pickup or delivery." }, { status: 400 });
    if (!validText(deliveryLocation, 500, mode === "delivery")) return NextResponse.json({ error: "Add the delivery location or landmark." }, { status: 400 });
    if (!validText(instructions, 1200) || !validText(scheduledFor, 80, true)) return NextResponse.json({ error: "Check your order notes and preferred time." }, { status: 400 });
    if (!Array.isArray(items) || items.length < 1 || items.length > 25) return NextResponse.json({ error: "Add at least one menu item (up to 25 different items)." }, { status: 400 });

    const submitted: SubmittedItem[] = [];
    for (const raw of items) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return NextResponse.json({ error: "One of the selected items is invalid." }, { status: 400 });
      const item = raw as Record<string, unknown>;
      if (!validText(item.menuItemId, 128, true) || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 20) {
        return NextResponse.json({ error: "Check the quantity for each item." }, { status: 400 });
      }
      submitted.push({ menuItemId: item.menuItemId, quantity: Number(item.quantity) });
    }
    if (new Set(submitted.map(item => item.menuItemId)).size !== submitted.length) return NextResponse.json({ error: "Each menu item should appear once in your cart." }, { status: 400 });

    const db = getFirestore(app);
    const verifiedItems: { menuItemId: string; name: string; price: number; quantity: number }[] = [];
    for (const item of submitted) {
      const snapshot = await db.collection("menu").doc(item.menuItemId).get();
      if (!snapshot.exists) return NextResponse.json({ error: "A menu item is no longer available. Refresh the menu and try again." }, { status: 409 });
      const menuItem = snapshot.data() ?? {};
      const price = menuItem.price;
      if (menuItem.available !== true || typeof menuItem.name !== "string" || !menuItem.name.trim() || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "A menu item is no longer available at a confirmed price. Refresh the menu and try again." }, { status: 409 });
      }
      verifiedItems.push({ menuItemId: item.menuItemId, name: menuItem.name.slice(0, 160), price, quantity: item.quantity });
    }

    const total = Number(verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    const ref = db.collection("orders").doc(orderId);
    const saved = await db.runTransaction(async transaction => {
      const existing = await transaction.get(ref);
      if (existing.exists) {
        const data = existing.data() ?? {};
        if (data.customerId === decoded.uid && data.customerName === customerName.trim() && data.phone === phone.trim() && data.branch === branch && JSON.stringify(data.items) === JSON.stringify(verifiedItems)) return { duplicate: true, total: Number(data.total) || 0 };
        throw new Error("ORDER_REFERENCE_CONFLICT");
      }
      const now = new Date().toISOString();
      const order: DocumentData = {
        customerId: decoded.uid,
        createdAt: now,
        customerName: customerName.trim(),
        phone: phone.trim(),
        branch,
        mode,
        scheduledFor,
        deliveryLocation: mode === "delivery" ? deliveryLocation.trim() : "",
        instructions: instructions.trim(),
        items: verifiedItems,
        total,
        status: "New",
        paymentStatus: "unpaid",
        paymentMethod: "unpaid",
        amountPaid: 0,
      };
      transaction.create(ref, order);
      return { duplicate: false, total };
    });

    return NextResponse.json({ orderId, total: saved.total, alreadySaved: saved.duplicate }, { status: saved.duplicate ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "ORDER_SERVICE_NOT_CONFIGURED") return NextResponse.json({ error: "Ordering is not fully connected yet. Your details have not been sent; please try again later." }, { status: 503 });
    if (message === "ORDER_SERVICE_CREDENTIALS_INVALID" || message === "ORDER_SERVICE_PROJECT_MISMATCH") return NextResponse.json({ error: "Ordering is temporarily unavailable. Your details have not been sent." }, { status: 503 });
    if (message === "ORDER_REFERENCE_CONFLICT") return NextResponse.json({ error: "This order reference is already in use. Refresh the page and try again." }, { status: 409 });
    if (/expired|token|authentication/i.test(message)) return NextResponse.json({ error: "Your order session expired. Please retry." }, { status: 401 });
    console.error("[Strata] order submission failed:", message || "unknown error");
    return NextResponse.json({ error: "We couldn’t confirm your order. Keep this page open and retry." }, { status: 400 });
  }
}
