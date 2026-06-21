import type { Metadata } from "next";
import { HomeDashboard } from "@/components/home-dashboard";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Music Sources | Sky Blue Studio Music Tracker",
  description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
    url: "/",
  },
  twitter: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, starting with the KSBJ master list.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    name: "Music tracking sources",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "KSBJ tracker",
        url: `${siteUrl}/ksbj`,
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeDashboard />
    </>
  );
}
