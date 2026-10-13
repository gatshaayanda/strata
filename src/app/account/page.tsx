import { redirect } from "next/navigation";

export const metadata = { title: "My orders", description: "View your Strata Sa’o Bitsa order history." };

export default function AccountPage() {
  redirect("/my-orders");
}
