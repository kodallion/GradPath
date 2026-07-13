import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GradPath",
    short_name: "GradPath",
    description: "Every application. One calm place.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F8F6",
    theme_color: "#3F75FF",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
