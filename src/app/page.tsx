import { SongDashboard } from "@/components/song-dashboard";
import { getSongData } from "@/lib/song-data";

export default async function Home() {
  const songData = await getSongData();

  return (
    <main className="min-h-screen transition-colors">
      <SongDashboard {...songData} />
    </main>
  );
}
