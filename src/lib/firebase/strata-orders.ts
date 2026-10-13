"use client";

import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type StrataOrderStatus =
  | "New"
  | "Received"
  | "Confirmed"
  | "Preparing"
  | "Ready for pickup"
  | "Out for delivery"
  | "Completed"
  | "Cancelled";

export type StrataOrderRequest = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
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

export async function createStrataOrderRequest(
  data: Omit<StrataOrderRequest, "id">
): Promise<string> {
  const reference = await addDoc(requests, data);
  return reference.id;
}

export function subscribeToMyStrataOrders(
  uid: string,
  onChange: (orders: StrataOrderRequest[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(requests, where("customerId", "==", uid)),
    snapshot => onChange(
      snapshot.docs
        .map(item => ({ id: item.id, ...item.data() as Omit<StrataOrderRequest, "id"> }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    ),
    error => onError(error instanceof Error ? error : new Error("Your order requests could not be loaded."))
  );
}
