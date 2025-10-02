"use client";
import React from "react";
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import FAQSection from "@/components/marketing/FAQSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, Upload, Languages, Shield, Zap, AudioLines, Play, Pause, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CreditCard, Settings, MessageSquare, Bot } from "lucide-react";

// Helpers de animación -----------------------------
function Reveal({ children, delay = 0, y = 20, once = true, className = "" }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { margin: "-10% 0px -10% 0px", once });
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 to-blue-500"
    />
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Landing page for an Audio → Text transcription app
// TailwindCSS + shadcn/ui + framer-motion + lucide-react

const FAQ_ITEMS = [
  {
    category: "General",
    icon: MessageSquare,
    question: "Is there a free trial?",
    answer: <>Yes — try it free for 10 minutes of transcription. No credit card needed.</>,
  },
  {
    category: "Pricing",
    icon: CreditCard,
    question: "How does billing work?",
    answer: <>Monthly subscription with prorated upgrades. Cancel anytime.</>,
  },
  {
    category: "Dashboard",
    icon: Settings,
    question: "Can I change my account email?",
    answer: <>Yes, from Settings → Profile. We’ll re-verify your address.</>,
  },
  {
    category: "API",
    icon: Bot,
    question: "Do you have a public API?",
    answer: <>Yes. REST endpoints with keys, rate limits, and webhooks.</>,
  },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      <ScrollProgressBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Noise />
        <Grid />
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-12 md:pt-28">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Reveal>
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  Turn audio into clean, searchable text—
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"> instantly</span>.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-5 max-w-xl text-zinc-300">
                  Upload recordings, lectures, meetings, podcasts—get accurate transcripts with timestamps, speaker labels, and export-ready formats.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mx-auto mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600" asChild>
                    <Link href="/dashboard/upload" className="">
                      <Upload className="mr-2 size-4" /> Upload audio
                    </Link>
                  </Button>

                  <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                    <Play className="mr-2 size-4" /> See a live demo
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.26}>
                <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-2"><Shield className="size-4" />GDPR-ready</div>
                  <div className="flex items-center gap-2"><Zap className="size-4" /><span>Under 30s for a 1‑hr file*</span></div>
                  <div className="flex items-center gap-2"><Languages className="size-4" />100+ languages</div>
                </div>
              </Reveal>
            </div>

            {/* Demo card */}
            <Reveal y={24}>
              <Card className="border-white/10 bg-white/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base text-zinc-200">
                    <span className="flex items-center gap-2"><AudioLines className="size-5" /> Sample transcript</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/10 text-white">Auto‑punctuation</Badge>
                      <Badge variant="secondary" className="bg-white/10 text-white">Speaker labels</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-24 w-full rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-3">
                    <FakeWaveform />
                  </div>
                  <TranscriptPreview />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Logos / social proof */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center text-xs uppercase tracking-wider text-zinc-400"
        >
          Trusted by teams, students & creators
        </motion.p>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid grid-cols-2 place-items-center gap-6 opacity-70 sm:grid-cols-3 md:grid-cols-6"
        >
          {['NovaLabs', 'ClassNote', 'MeetFlow', 'PodKit', 'Syncly', 'Captionly'].map((n) => (
            <motion.div key={n} variants={item} className="text-sm">{n}</motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold md:text-4xl">Everything you need to get from voice to insight</h2>
            <p className="mt-3 text-zinc-300">Fast, accurate, and export‑friendly. No fiddling required.</p>
          </div>
        </Reveal>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          <Feature motionProps={{ variants: item }} icon={Mic} title="Accurate by design" desc="Modern AI models with domain‑tuned prompts for meetings, lectures, and calls." />
          <Feature motionProps={{ variants: item }} icon={Languages} title="Multilingual" desc="Transcribe and auto‑translate in 100+ languages with locale‑aware punctuation." />
          <Feature motionProps={{ variants: item }} icon={Upload} title="Drag & drop" desc="Upload MP3, WAV, M4A, MP4, and more. We handle variable bit‑rates and long files." />
          <Feature motionProps={{ variants: item }} icon={Shield} title="Private & secure" desc="Encryption in transit & at rest. Keep data in your region with enterprise plan." />
          <Feature motionProps={{ variants: item }} icon={Zap} title="Lightning fast" desc="GPU‑powered pipeline. Typical 1‑hr file in under 30 seconds with queueing." />
          <Feature motionProps={{ variants: item }} icon={Check} title="Export anywhere" desc="TXT, DOCX, SRT/VTT captions, JSON with timestamps, or copy as Markdown." />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {[
            { step: 1, title: "Upload your audio", desc: "Drop a file or paste a URL. We detect language and audio quality automatically." },
            { step: 2, title: "We transcribe & label", desc: "Speaker diarization, smart punctuation, filler‑word cleanup, and timestamps." },
            { step: 3, title: "Edit & export", desc: "Quick edits in the browser. Export to SRT, DOCX, TXT, or copy to your notes." }
          ].map((s) => (
            <motion.div key={s.step} variants={item}>
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <span className="mr-2 rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">{s.step}</span>
                    {s.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-300">{s.desc}</CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 md:p-10">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-semibold md:text-3xl">Try EchoWrite free</h3>
                <p className="mt-2 text-blue-50/90">10 minutes of transcription on us. No credit card needed.</p>
                <form className="mt-5 flex max-w-sm gap-3">
                  <Input placeholder="Enter your email" className="bg-white text-zinc-900 placeholder:text-zinc-500" />
                  <Button type="button" className="bg-zinc-900 hover:bg-zinc-800">Get invite</Button>
                </form>
                <p className="mt-2 text-sm text-blue-50/80">By continuing you agree to our Terms & Privacy.</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 p-4">
                <ul className="grid gap-3 text-sm">
                  {[
                    "Unlimited uploads during trial",
                    "Timestamped JSON export",
                    "Speaker labels",
                    "SRT/VTT captions",
                    "Priority processing queue"
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-2"><Check className="size-4" /> {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-4 pb-24">
        <Reveal>
          <FAQSection items={FAQ_ITEMS} className="pb-24 px-4" />
        </Reveal>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, desc, motionProps = {} }) {
  return (
    <motion.div {...motionProps} className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-white/10">
          <Icon className="size-5" />
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-zinc-300">{desc}</p>
    </motion.div>
  );
}

function TranscriptPreview() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-2">
        <div className="mt-1 size-2 rounded-full bg-emerald-400" />
        <p className="text-zinc-200">
          <span className="mr-2 rounded bg-white/10 px-2 py-0.5 text-xs text-zinc-300">00:00</span>
          <span className="font-medium text-emerald-300">Speaker 1:</span> Welcome everyone, thanks for joining. Today we’ll cover the launch checklist and timelines…
        </p>
      </div>
      <div className="flex items-start gap-2">
        <div className="mt-1 size-2 rounded-full bg-sky-400" />
        <p className="text-zinc-200">
          <span className="mr-2 rounded bg-white/10 px-2 py-0.5 text-xs text-zinc-300">00:12</span>
          <span className="font-medium text-sky-300">Speaker 2:</span> Quick update from design: we finalized the components and handed them to dev…
        </p>
      </div>
      <div className="flex items-start gap-2">
        <div className="mt-1 size-2 rounded-full bg-fuchsia-400" />
        <p className="text-zinc-200">
          <span className="mr-2 rounded bg-white/10 px-2 py-0.5 text-xs text-zinc-300">00:34</span>
          <span className="font-medium text-fuchsia-300">Speaker 3:</span> Let’s lock scope today so we can start QA on Friday…
        </p>
      </div>
    </div>
  );
}

// ✅ Exporta y acepta className para controlar altura desde fuera
export function FakeWaveform({
  className = "",
  bars = 64,                 // más barras = más “detalle”
  floorPct = 0.008,           // altura mínima relativa (0..1)
  centers = [0.18, 0.5, 0.82],
  sigmas = [0.06, 0.085, 0.06],
  amps = [0.8, 1.0, 0.8],
  gapPx = 4,                 // separación entre barras
  barWidth = 5,              // grosor de barra (px) tipo “equalizer”
} = {}) {
  const ampSum = React.useMemo(
    () => amps.reduce((a, b) => a + b, 0),
    [amps]
  );

  const vals = React.useMemo(() => {
    return Array.from({ length: bars }, (_, i) => {
      const x = i / (bars - 1);
      const sum = centers.reduce((acc, m, idx) => {
        const s = sigmas[idx];
        const a = amps[idx];
        const z = (x - m) / s;
        return acc + a * Math.exp(-0.5 * z * z);
      }, 0);

      // normalizado 0..1 con un leve boost para marcar picos
      const t = Math.min(1, (sum / ampSum) * 2.2);
      const hPct = floorPct + t * (1 - floorPct); // 0..1
      return hPct;
    });
  }, [bars, centers, sigmas, amps, ampSum, floorPct]);

  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-visible ${className}`}
      style={{ gap: `${gapPx}px`, color: "currentColor" }}
    >
      {vals.map((hPct, i) => (
        <div
          key={i}
          className="bg-current"
          style={{
            height: `${hPct * 100}%`,  // porcentaje ⇒ no se corta
            width: barWidth,
            borderRadius: 9999,
          }}
        />
      ))}
    </div>
  );
}


function Grid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(59,130,246,0.18),rgba(0,0,0,0)_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.15]" />
    </div>
  );
}

function Noise() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-20 mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'2\\'/%3E%3CfeColorMatrix type=\\'saturate\\' values=\\'0\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23n)\\'/%3E%3C/svg%3E')" }} />
  );
}
