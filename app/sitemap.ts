import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://magicworks.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "#about", "#experience", "#project", "#skill", "#education", "#cta"];
  return pages.map((p, i) => ({
    url: `${SITE_URL}/${p}`,
    lastModified: now,
    changeFrequency: i === 0 ? "weekly" : "monthly",
    priority: i === 0 ? 1 : 0.7,
    alternates: {
      languages: {
        en: `${SITE_URL}/en${p ? `/${p}` : ""}`,
        id: `${SITE_URL}/id${p ? `/${p}` : ""}`,
        de: `${SITE_URL}/de${p ? `/${p}` : ""}`,
        es: `${SITE_URL}/es${p ? `/${p}` : ""}`,
        "zh-CN": `${SITE_URL}/zh-CN${p ? `/${p}` : ""}`,
      },
    },
  }));
}
