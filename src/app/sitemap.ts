import type { MetadataRoute } from "next";
import { getArtistSummaries } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artists = await getArtistSummaries();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ksbj`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/klove`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...artists.map((artist) => ({
      url: `${siteUrl}/artists/${artist.slug}`,
      lastModified: artist.latestPlayedAt ? new Date(artist.latestPlayedAt) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
