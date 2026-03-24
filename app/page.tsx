import Navigation from "@/components/Navigation";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Works from "@/components/sections/Works";
import Archive from "@/components/sections/Archive";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Manifesto />
        <Works /> {/* Built by Motion agent */}
        <Archive /> {/* Built by Motion agent */}
        <About />
        <Contact />
      </main>
    </>
  );
}
