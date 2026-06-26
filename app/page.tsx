// app/page.tsx
import { Hero } from "./components/Hero";
import { Achievements } from "./components/Achievements";
import { Services } from "./components/Services";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar/>
      <Hero />
      <Achievements />
      <Services />
      <Contact />
      <Footer />
    </main>
  );
}