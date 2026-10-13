import { redirect } from "next/navigation";

export const metadata = { title: "Strata Sa’o Bitsa", description: "Browse the current food menu." };

export default function SavedPage() {
  redirect("/");
}
