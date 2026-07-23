"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Users,
  Award,
  TrendingUp,
  Menu,
  X,
  GraduationCap,
  Stethoscope,
  HandHeart,
  Home as HomeIcon,
  ShieldCheck,
  Sprout,
  Handshake,
  MapPin,
  Phone,
  Mail,
  Send,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Textarea } from "./components/ui/TextArea";
import Link from "next/link";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "bg-white/80 border-b border-green-100/50 shadow-sm"
          : "bg-white/40"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 h-16">
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2c6e49] text-white text-sm font-semibold tracking-tight shadow-md group-hover:shadow-lg transition-all">
            TW
          </div>
          <span className="font-medium text-[15px] tracking-tight text-gray-800">
            Tamimi Welfare
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-gray-500 hover:text-[#2c6e49] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/register">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-[#2c6e49] hover:bg-[#2c6e49]/5"
            >
            Login
          </Button>
            </Link>
         <Link href="/register">
          <Button className="group bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-md hover:shadow-lg transition-all">
            Become a member
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Button>
         </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 rounded-lg text-gray-700 hover:bg-[#2c6e49]/5 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-green-100/50 bg-white/95 backdrop-blur-sm animate-slide-up">
          <div className="mx-auto max-w-6xl px-5 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#2c6e49]/5 hover:text-[#2c6e49] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-3 border-t border-green-100/50">
              <Button variant="outline" className="w-full border-gray-200">
                Login
              </Button>
              <Button className="w-full bg-[#2c6e49] hover:bg-[#1f5234] text-white">
                Become a member
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-green-50/50 via-white to-green-50/30">
      {/* Ambient shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[#2c6e49]/5 blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-[#2c6e49]/5 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2c6e49]/20 bg-white/60 backdrop-blur px-3.5 py-1 text-xs font-medium text-[#2c6e49] animate-fade-in">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2c6e49] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2c6e49]" />
          </span>
          Est. 2014 · Serving communities since day one
        </div>

        <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-[-0.03em] text-gray-800 animate-slide-up">
          Empowering communities.
          <br />
          <span className="text-[#2c6e49]">Transforming lives.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-base sm:text-lg text-gray-500 leading-relaxed animate-slide-up">
          Tamimi Welfare Trust works alongside families across health, education,
          and community — building outcomes that last, together.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-slide-up">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#2c6e49] text-white text-sm font-medium hover:bg-[#1f5234] transition-all shadow-lg hover:shadow-xl"
          >
            Become a member
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#programs"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-gray-700 hover:text-[#2c6e49] transition-colors"
          >
            See our work
          </a>
        </div>

        {/* Inline mini-stats */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fade-in">
          {[
            { v: "12K+", l: "Meals served" },
            { v: "850+", l: "Families supported" },
            { v: "45", l: "Active projects" },
          ].map((s) => (
            <div key={s.l} className="text-left border-l border-green-200 pl-4">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-800">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ["Health", "Education", "Family", "Outreach", "Dignity", "Community", "Care", "Trust"];
  const row = [...words, ...words];
  return (
    <section className="border-y border-green-100/50 bg-gray-50/50 py-6 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-12 text-sm font-medium uppercase tracking-[0.25em] text-gray-500">
            {w}
            <span className="h-1.5 w-1.5 rounded-full bg-[#2c6e49]/30" />
          </span>
        ))}
      </div>
    </section>
  );
}

const stats = [
  { icon: Heart, value: "12,480", label: "Meals served this year" },
  { icon: Users, value: "850+", label: "Families in ongoing care" },
  { icon: Award, value: "45", label: "Programs across 12 cities" },
  { icon: TrendingUp, value: "98%", label: "Of funds reach the field" },
];

function Stats() {
  return (
    <section id="impact" className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#2c6e49]">
              Our impact
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl text-gray-800">
              Numbers that stand behind every promise.
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm">
            Audited annually. Reported openly. Every rupee is traceable to the
            hands that receive it.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-green-100/50 rounded-2xl overflow-hidden border border-green-100/50">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group bg-white p-8 transition-colors hover:bg-green-50/30"
            >
              <s.icon size={20} className="text-[#2c6e49]" strokeWidth={1.5} />
              <div className="mt-8 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-gray-800">
                {s.value}
              </div>
              <div className="mt-3 text-sm text-gray-500 leading-relaxed">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const programs = [
  {
    icon: Stethoscope,
    title: "Health & Wellness",
    desc: "Mobile clinics, medical camps, and long-term wellness support for underserved neighborhoods.",
    tag: "01",
  },
  {
    icon: HomeIcon,
    title: "Family Support",
    desc: "Financial aid, counseling, and essentials for families navigating hardship or transition.",
    tag: "02",
  },
  {
    icon: GraduationCap,
    title: "Education for All",
    desc: "Scholarships, learning materials, and tutoring for children and youth from any background.",
    tag: "03",
  },
  {
    icon: HandHeart,
    title: "Community Outreach",
    desc: "Neighborhood programs, food drives, and volunteer-led initiatives shaped by local voices.",
    tag: "04",
  },
];

function Programs() {
  return (
    <section id="programs" className="py-24 lg:py-32 bg-gray-50/30">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#2c6e49]">
            What we do
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl text-gray-800">
            Four programs, one shared idea — <span className="text-[#2c6e49]">people first</span>.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {programs.map((p) => (
            <div
              key={p.title}
              className="hover-lift group rounded-2xl border border-green-100/50 bg-white/80 backdrop-blur-sm p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2c6e49]/10 text-[#2c6e49]">
                  <p.icon size={22} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium tracking-[0.15em] text-gray-400">{p.tag}</span>
              </div>
              <h3 className="mt-8 text-2xl text-gray-800">{p.title}</h3>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#2c6e49] opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: ShieldCheck,
    title: "Transparency",
    desc: "Public reporting, open audits, and traceable spending — always.",
  },
  {
    icon: Handshake,
    title: "Community-first",
    desc: "Programs designed with, and led by, the people we serve.",
  },
  {
    icon: Sprout,
    title: "Lasting impact",
    desc: "Long-term outcomes over short-term relief — measurable and enduring.",
  },
];

function Values() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#2c6e49]">
              Our principles
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl text-gray-800 leading-tight">
              Built on quiet discipline and open books.
            </h2>
            <p className="mt-6 text-gray-500 leading-relaxed">
              Three commitments shape every program, partnership, and rupee we
              steward. They aren't slogans — they're the working rules of the trust.
            </p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="flex gap-6 rounded-2xl border border-green-100/50 bg-gray-50/30 p-6 hover:border-[#2c6e49]/40 transition-colors"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-green-100/50 text-[#2c6e49]">
                  <f.icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-xl text-gray-800">{f.title}</h3>
                    <span className="text-xs text-gray-400">0{i + 1}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const contactInfo = [
  { icon: MapPin, title: "Visit", value: "12 Community Lane, Karachi, PK" },
  { icon: Phone, title: "Call", value: "+92 300 000 0000" },
  { icon: Mail, title: "Email", value: "hello@tamimiwelfare.org" },
];

function Contact() {
  return (
    <section id="contact" className="py-24 lg:py-32 bg-gray-50/30">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#2c6e49]">
            Get in touch
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl text-gray-800">
            Partner with us. Volunteer. Or simply say hello.
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((c) => (
              <div
                key={c.title}
                className="flex items-start gap-4 rounded-2xl border border-green-100/50 bg-white/80 backdrop-blur-sm p-5 hover:border-[#2c6e49]/40 transition-colors shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2c6e49]/10 text-[#2c6e49]">
                  <c.icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    {c.title}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-800">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="lg:col-span-3 rounded-2xl border border-green-100/50 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  className="mt-2 w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] bg-white/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] bg-white/50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Message
              </label>
              <Textarea
                rows={5}
                placeholder="Tell us how you'd like to help…"
                className="mt-2 w-full border-gray-200 focus:border-[#2c6e49] focus:ring-[#2c6e49] bg-white/50 resize-none"
              />
            </div>
            <Button
              type="submit"
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-lg hover:shadow-xl transition-all"
            >
              Send message <Send size={14} />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#14532d] text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
                TW
              </div>
              <span className="font-medium">Tamimi Welfare Trust</span>
            </div>
            <p className="mt-5 text-sm opacity-70 max-w-xs leading-relaxed">
              A community-first welfare trust. Compassion, discipline, and open books
              since 2014.
            </p>
          </div>
          <div className="text-sm">
            <div className="text-xs uppercase tracking-wider opacity-60">Explore</div>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#about" className="hover:opacity-100 opacity-80 transition-opacity">About</a></li>
              <li><a href="#programs" className="hover:opacity-100 opacity-80 transition-opacity">Programs</a></li>
              <li><a href="#impact" className="hover:opacity-100 opacity-80 transition-opacity">Impact</a></li>
              <li><a href="#contact" className="hover:opacity-100 opacity-80 transition-opacity">Contact</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="text-xs uppercase tracking-wider opacity-60">Reach us</div>
            <ul className="mt-4 space-y-2.5 opacity-80">
              <li>hello@tamimiwelfare.org</li>
              <li>+92 300 000 0000</li>
              <li>Karachi, Pakistan</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-70">
          <div>© {new Date().getFullYear()} Tamimi Welfare Trust. All rights reserved.</div>
          <div>Compassion. Community. Change.</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Programs />
        <Values />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}