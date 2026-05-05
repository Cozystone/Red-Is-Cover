import KeychainNav from "@/components/ui/KeychainNav";
import VideoHero from "@/components/sections/VideoHero";
import Landing from "@/components/sections/Landing";
import World from "@/components/sections/World";
import Categories from "@/components/sections/Categories";
import Archive from "@/components/sections/Archive";
import Profile from "@/components/sections/Profile";
import Contact from "@/components/sections/Contact";
import PinterestBoard from "@/components/sections/PinterestBoard";
import CustomCursor from "@/components/ui/CustomCursor";
import BackgroundField from "@/components/ui/BackgroundField";
import GunOverlay from "@/components/ui/GunOverlay";
import AdminDoor from "@/components/sections/AdminDoor";
import { GunProvider } from "@/lib/gunContext";
import { AdminProvider } from "@/lib/adminContext";

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <AdminProvider>
    <GunProvider>
      <CustomCursor />
      <BackgroundField />
      <KeychainNav />
      <GunOverlay />
      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── First viewport: Landing behind VideoHero ──────────────────── */}
        {/* Landing (red+grass) is the "room" behind the sea-window glass.   */}
        {/* VideoHero (sea video) sits in front; gun shot reveals Landing.   */}
        <div style={{
          position:   'relative',
          height:     '100dvh',
          minHeight:  '600px',
          overflow:   'hidden',
        }}>
          {/* Landing — lower z-index, visually behind */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Landing />
          </div>

          {/* VideoHero — higher z-index, in front (the "glass" that gets shot) */}
          {/* pointerEvents:none lets the section inside control its own events */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            <VideoHero />
          </div>
        </div>

        {/* ── Rest of page ─────────────────────────────────────────────────── */}
        <PinterestBoard />
        <World />
        <Categories />
        <Archive />
        <Profile />
        <AdminDoor />
        <Contact />
      </main>
    </GunProvider>
    </AdminProvider>
  );
}
