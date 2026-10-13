import { redirect } from "next/navigation";

export const metadata = { title: "Menu studio", robots: { index: false, follow: false } };

export default function LegacyStorefrontAdminPage() {
  redirect("/admin");
}
