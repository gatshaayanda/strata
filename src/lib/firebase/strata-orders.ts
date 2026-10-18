"use client";

import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const STRATA_ORDER_STATUSES = [
  "New", "Received", "Confirmed", "Preparing",
  "Ready for pickup", "Out for delivery", "Completed", "Cancelled"
] as const;
export type StrataOrderStatus = typeof STRATA_ORDER_STATUSES[number];

export type StrataOrderRequest = {
  id: string;
  customerId: string;
  customerName: string;
  phone?: string;
  city: "Gaborone" | "Francistown";
  fulfilment: "Delivery" | "Pickup" | "Need help deciding";
  itemsText: string;
  deliveryLocation: string;
  notes: string;
  status: StrataOrderStatus;
  staffNote?: string;
  source: "website";
  createdAt: string;
  updatedAt: string;
};

const requests = collection(db, "orderRequests");

export async function createStrataOrderRequest(data: Omit<StrataOrderRequest, "id">): Promise<string> {
  const reference = await addDoc(requests, data);
  return reference.id;
}

function asRequests(snapshot: import("firebase/firestore").QuerySnapshot) {
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() as Omit<StrataOrderRequest, "id"> }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeToMyStrataOrders(uid: string, onChange: (orders: StrataOrderRequest[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    query(requests, where("customerId", "==", uid)),
    snapshot => onChange(asRequests(snapshot)),
    error => onError(error instanceof Error ? error : new Error("Your order requests could not be loaded."))
  );
}

export function subscribeToAllStrataOrders(onChange: (orders: StrataOrderRequest[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    requests,
    snapshot => onChange(asRequests(snapshot)),
    error => onError(error instanceof Error ? error : new Error("The Strata order queue could not be loaded."))
  );
}

export async function updateStrataOrder(id: string, status: StrataOrderStatus, staffNote: string) {
  await updateDoc(doc(db, "orderRequests", id), {
    status,
    staffNote: staffNote.trim().slice(0, 1000),
    updatedAt: new Date().toISOString()
  });
}
