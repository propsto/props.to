import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/request-early-access", "/terms", "/privacy"].map(path => ({
    url: `https://props.to${path}`,
  }));
}
