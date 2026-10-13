import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Strata Sa’o Bitsa | Fish & Food",
    short_name: "Strata Sa’o Bitsa",
    description: "Install Strata Sa’o Bitsa for one-tap access to fish and food ordering in Botswana. COME GET HOOKED.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#D71920",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["food", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/strata-icon.svg", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/strata-icon.svg", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/strata-icon.svg", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      {
        name: "Start an order",
        short_name: "Request",
        description: "Ask Strata Sa’o Bitsa to source a sneaker or food item",
        url: "/request",
        icons: [{ src: "/strata-icon.svg", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "My orders",
        short_name: "Orders",
        description: "Track your food order",
        url: "/account",
        icons: [{ src: "/strata-icon.svg", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Strata Sa’o Bitsa admin",
        short_name: "Admin",
        description: "Open protected operations dashboard",
        url: "/admin",
        icons: [{ src: "/strata-icon.svg", sizes: "192x192", type: "image/png" }]
      }
    ]
  };
}
