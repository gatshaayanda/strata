import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Strata Sa’o Bitsa — Come Get Hooked",
    short_name: "Strata",
    description: "Fish, chips and good times. Strata Sa’o Bitsa in Botswana.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#101010",
    theme_color: "#101010",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["food", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "Start an order", short_name: "Order", description: "Send Strata an order request", url: "/order", icons: [{ src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "Find a location", short_name: "Locations", description: "Check Gaborone and Francistown service", url: "/#locations", icons: [{ src: "/strata-icon.svg", sizes: "any", type: "image/svg+xml" }] }
    ]
  };
}
