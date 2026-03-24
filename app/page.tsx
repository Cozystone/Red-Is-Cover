import Navigation from "@/components/Navigation";
import VideoHero from "@/components/sections/VideoHero";
import Landing from "@/components/sections/Landing";
import World from "@/components/sections/World";
import Categories from "@/components/sections/Categories";
import Archive from "@/components/sections/Archive";
import Profile from "@/components/sections/Profile";
import Contact from "@/components/sections/Contact";
import CustomCursor from "@/components/ui/CustomCursor";
import BackgroundField from "@/components/ui/BackgroundField";
import GunOverlay from "@/components/ui/GunOverlay";
import { GunProvider } from "@/lib/gunContext";

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <GunProvider>
      <CustomCursor />
      <BackgroundField />
      <Navigation />
      <GunOverlay />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <VideoHero />
        <Landing />
        <World />
        <Categories />
        <Archive />
        <Profile />
        <Contact />
      </main>
    </GunProvider>
  );
}
