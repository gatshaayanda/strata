import { redirect } from "next/navigation";

export const metadata = { title: "Order food", description: "Start a Strata Sa’o Bitsa food order." };

export default function RequestPage() {
  redirect("/order");
}
