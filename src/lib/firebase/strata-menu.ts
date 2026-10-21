"use client";

import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type StrataMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  sortOrder: number;
  updatedAt: string;
};

export const STARTER_STRATA_MENU: StrataMenuItem[] = [
  { id: "fish-and-chips", name: "Fish & Chips", description: "Fish served with golden chips.", price: 70, active: true, sortOrder: 1, updatedAt: "2026-10-18T00:00:00.000Z" },
  { id: "fish-and-rice", name: "Fish & Rice", description: "Fish served with rice.", price: 70, active: true, sortOrder: 2, updatedAt: "2026-10-18T00:00:00.000Z" },
];

const menuCollection = collection(db, "strataMenu");

export function subscribeToStrataMenu(onChange: (items: StrataMenuItem[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(menuCollection, snapshot => {
    const items = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() as Omit<StrataMenuItem, "id"> }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    onChange(items);
  }, error => onError(error instanceof Error ? error : new Error("The Strata menu could not be loaded.")));
}

export async function saveStrataMenuItem(item: StrataMenuItem): Promise<void> {
  await setDoc(doc(db, "strataMenu", item.id), {
    name: item.name.trim().slice(0, 80),
    description: item.description.trim().slice(0, 240),
    price: Math.round(item.price * 100) / 100,
    active: item.active,
    sortOrder: item.sortOrder,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteStrataMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "strataMenu", id));
}

export async function seedStrataMenuIfEmpty(): Promise<"seeded" | "exists"> {
  const snapshot = await getDocs(menuCollection);
  if (snapshot.size > 0) return "exists";
  for (const item of STARTER_STRATA_MENU) {
    await setDoc(doc(db, "strataMenu", item.id), { name: item.name, description: item.description, price: item.price, active: item.active, sortOrder: item.sortOrder, updatedAt: new Date().toISOString() });
  }
  return "seeded";
}

export function slugifyMenuItem(name: string): string {
  return name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "menu-item";
}
