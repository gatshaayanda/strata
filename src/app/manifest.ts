import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Strata Sa’o Bitsa | Fish & Food",
    short_name: "Sa’o Bitsa",
    description: "Fish and food ordering in Botswana. COME GET HOOKED.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4ED",
    theme_color: "#D71920",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["food", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      { name: "Start an order", short_name: "Order", description: "Choose food and submit an order", url: "/order", icons: [{ src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "My orders", short_name: "Orders", description: "View your saved food orders", url: "/my-orders", icons: [{ src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "Staff access", short_name: "Staff", description: "Open the protected operations dashboard", url: "/admin", icons: [{ src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml" }] }
    ]
  };
}
