import type { Metadata } from "next";
import { HomeDashboard } from "@/components/home-dashboard";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Music Sources | Sky Blue Studio Music Tracker",
  description: "Browse music tracking dashboards by source, including KSBJ and K-LOVE.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, including KSBJ and K-LOVE.",
    url: "/",
  },
  twitter: {
    title: "Music Sources | Sky Blue Studio Music Tracker",
    description: "Browse music tracking dashboards by source, including KSBJ and K-LOVE.",
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
      {
        "@type": "ListItem",
        position: 2,
        name: "K-LOVE tracker",
        url: `${siteUrl}/klove`,
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
