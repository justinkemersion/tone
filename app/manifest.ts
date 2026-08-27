import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tone",
    short_name: "Tone",
    description: "Open the site, play a string, tune the guitar.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0f12",
    theme_color: "#0d0f12",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
