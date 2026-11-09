import type { MetadataRoute } from "next";

const CANONICAL_HOST = "https://www.makadverts.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/admin",
          "/admin/*",
          "/login",
          "/auth/*",
          "/api/*",
          "/post/*/payment",
          "/post/*/done",
        ],
      },
    ],
    sitemap: `${CANONICAL_HOST}/sitemap.xml`,
  };
}
