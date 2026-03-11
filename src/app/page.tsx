'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight,
  BrainCircuit,
  Copy,
  Eye,
  Flame,
  Mail,
  Scan,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubZeroLogo } from '@/components/ui/logo';
import { ParticleBg } from '@/components/marketing/particle-bg';

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ──────────────────────────────────────
// Count-Up hook
// ──────────────────────────────────────

function useCountUp(target: number, duration = 1800, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return value;
}

// ──────────────────────────────────────
// Word Cycle
// ──────────────────────────────────────

const cycleWords = ['Subscriptions', 'Spending Leaks', 'Ghost Charges', 'Money Drains'];

function WordCycle() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % cycleWords.length), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: 260 }}>
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="gradient-text-bright"
      >
        {cycleWords[index]}
      </motion.span>
    </span>
  );
}

// ──────────────────────────────────────
// Kinetic Data Sphere (CSS 3D)
// ──────────────────────────────────────

function KineticSphere() {
  return (
    <div className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px] mx-auto animate-float">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-cyan-500/25 blur-3xl" />

      {/* Orbit ring 1 */}
      <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-orbit">
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_20px_#60a5fa]" />
        <div className="absolute -bottom-1 right-10 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
      </div>

      {/* Orbit ring 2 */}
      <div className="absolute inset-12 rounded-full border border-purple-500/20 animate-orbit-reverse">
        <div className="absolute top-4 -right-1 h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_16px_#a78bfa]" />
        <div className="absolute bottom-6 -left-1 h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_12px_#93c5fd]" />
      </div>

      {/* Orbit ring 3 (new) */}
      <div className="absolute inset-2 rounded-full border border-cyan-500/10 animate-orbit" style={{ animationDuration: '35s' }}>
        <div className="absolute top-1/2 -left-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300/60" />
      </div>

      {/* Core sphere */}
      <div className="absolute inset-20 md:inset-24 rounded-full bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-cyan-600/40 backdrop-blur-xl border border-white/10 shadow-[0_0_100px_hsl(217_91%_60%/0.2),inset_0_0_40px_rgba(255,255,255,0.03)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold gradient-text-bright">₹0</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 tracking-widest uppercase">wasted</p>
          </div>
        </div>
      </div>

      {/* Floating data points */}
      <div className="absolute top-[15%] right-[5%] glass rounded-lg px-3 py-1.5 text-xs animate-pulse-glow z-10">
        <span className="text-emerald-400 font-semibold">−₹899</span>
        <span className="text-muted-foreground ml-1">saved</span>
      </div>
      <div className="absolute bottom-[18%] left-[2%] glass rounded-lg px-3 py-1.5 text-xs animate-pulse-glow z-10" style={{ animationDelay: '1s' }}>
        <span className="text-blue-400 font-semibold">AI</span>
        <span className="text-muted-foreground ml-1">detected 3</span>
      </div>
      <div className="absolute top-[50%] left-[-5%] glass rounded-lg px-3 py-1.5 text-xs animate-pulse-glow z-10" style={{ animationDelay: '1.8s' }}>
        <span className="text-purple-400 font-semibold">↑ 12%</span>
        <span className="text-muted-foreground ml-1">forecast</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Social Proof Ticker
// ──────────────────────────────────────

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay',
  'Infosys', 'Wipro', 'Zoho', 'Freshworks', 'Swiggy',
  'PhonePe', 'CRED', 'Paytm', 'Groww', 'Meesho',
];

function SocialProofTicker() {
  return (
    <Section className="border-y border-white/[0.05] py-7 overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <motion.div variants={fadeIn} className="text-center mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
          Trusted by employees at
        </p>
      </motion.div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...companies, ...companies].map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="mx-8 text-sm font-semibold text-muted-foreground/40 select-none tracking-wide uppercase"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ──────────────────────────────────────
// Before / After Problem Section
// ──────────────────────────────────────

function ProblemSection() {
  return (
    <Section className="py-20 md:py-28 overflow-hidden">
      <div className="container max-w-6xl">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary mb-4">
            The Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight mt-4">
            You&apos;re paying for things you{' '}
            <span className="gradient-text">don&apos;t even remember</span>
          </h2>
        </motion.div>

        {/* Before / After split */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* BEFORE */}
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-red-500/25 bg-red-500/[0.03] p-6 md:p-8 group overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -top-3 left-6 bg-red-500/15 text-red-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/25">
              Without SubZero
            </div>
            <div className="mt-4 space-y-4">
              {[
                { text: 'Forgot about ₹599/mo music app', icon: '😰' },
                { text: 'Duplicate cloud storage paying twice', icon: '💸' },
                { text: 'Free trial converted — ₹1,499/yr charged', icon: '⏰' },
                { text: '₹12,000+ wasted annually on ghost subs', icon: '👻' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center pt-4 border-t border-red-500/10">
              <p className="text-3xl font-bold text-red-400">−₹12,000</p>
              <p className="text-xs text-muted-foreground mt-1">wasted per year</p>
            </div>
          </motion.div>

          {/* AFTER */}
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] p-6 md:p-8 group overflow-hidden"
          >
            {/* Hover glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -top-3 left-6 bg-emerald-500/15 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/25">
              With SubZero
            </div>
            <div className="mt-4 space-y-4">
              {[
                { text: 'AI auto-detected 14 subscriptions', icon: '🧠' },
                { text: 'Found 3 duplicates — cancelled instantly', icon: '✂️' },
                { text: 'Renewal alerts 7 days before charge', icon: '🔔' },
                { text: 'Full spending clarity in one dashboard', icon: '📊' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center pt-4 border-t border-emerald-500/10">
              <p className="text-3xl font-bold text-emerald-400">+₹30,000</p>
              <p className="text-xs text-muted-foreground mt-1">saved per year</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ──────────────────────────────────────
// Bento Grid Features — with cursor-tracking light
// ──────────────────────────────────────

const features = [
  {
    icon: Scan,
    title: 'AI Receipt Parsing',
    description: 'Our AI reads your email receipts and extracts subscription data automatically — no manual entry ever.',
    span: 'md:col-span-2',
    color: 'blue',
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    description: 'Instantly spots overlapping services like two cloud storage or streaming plans.',
    span: '',
    color: 'purple',
  },
  {
    icon: Flame,
    title: 'Future Burn Forecast',
    description: 'Projects your 3, 6, and 12-month subscription spending so you can plan ahead.',
    span: '',
    color: 'cyan',
  },
  {
    icon: Eye,
    title: 'Zero-Touch Sync',
    description: 'Connect Gmail once. SubZero monitors for new subscriptions automatically.',
    span: '',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'End-to-end encryption. OAuth only — we never store your email password.',
    span: 'md:col-span-2',
    color: 'purple',
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    glow: 'bg-blue-500/8',
    shadow: 'rgba(96,165,250,0.12)',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    glow: 'bg-purple-500/8',
    shadow: 'rgba(167,139,250,0.12)',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    glow: 'bg-cyan-500/8',
    shadow: 'rgba(34,211,238,0.12)',
  },
};

function BentoCard({ f }: { f: (typeof features)[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState({ x: 50, y: 50, opacity: 0 });
  const c = colorMap[f.color as keyof typeof colorMap];

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLight({ x, y, opacity: 1 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setLight((l) => ({ ...l, opacity: 0 }));
  }, []);

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`group glass glass-hover rounded-2xl p-6 md:p-8 ${f.span} relative overflow-hidden cursor-default`}
    >
      {/* Cursor-tracking light */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: light.opacity,
          background: `radial-gradient(200px circle at ${light.x}% ${light.y}%, ${c.shadow}, transparent 70%)`,
        }}
      />

      {/* Corner glow on hover */}
      <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl ${c.glow}`} />

      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} mb-5 icon-halo`}>
        <f.icon className={`h-6 w-6 ${c.text}`} />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
    </motion.div>
  );
}

function BentoGrid() {
  return (
    <Section id="features" className="py-20 md:py-28 border-y border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="container max-w-6xl">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight mt-4">
            Everything runs on{' '}
            <span className="gradient-text">autopilot</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Six intelligent engines working behind the scenes so you never waste a rupee again.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => <BentoCard key={f.title} f={f} />)}
        </div>
      </div>
    </Section>
  );
}

// ──────────────────────────────────────
// Stats Counter Section
// ──────────────────────────────────────

function StatCard({ value, label, numericValue, suffix, prefix }: {
  value: string;
  label: string;
  numericValue?: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useCountUp(numericValue ?? 0, 1800, inView && !!numericValue);

  const displayValue = numericValue
    ? `${prefix ?? ''}${count.toLocaleString()}${suffix ?? ''}`
    : value;

  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl md:text-4xl font-bold gradient-text-bright tabular-nums group-hover:scale-105 transition-transform duration-300 inline-block">
        {displayValue}
      </p>
      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle horizontal rule glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0 }}>
            <StatCard value="50,000+" label="Subscriptions Tracked" numericValue={50000} suffix="+" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}>
            <StatCard value="₹4.2 Cr" label="Saved for Users" prefix="₹" numericValue={42000000} suffix="" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}>
            <StatCard value="99.2%" label="AI Detection Rate" numericValue={99} suffix=".2%" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 }}>
            <StatCard value="<60s" label="Setup Time" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────
// Final CTA
// ──────────────────────────────────────

function FinalCTA() {
  return (
    <Section className="py-24 md:py-32 relative overflow-hidden grain-overlay">
      {/* Ambient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-blue-600/12 via-purple-600/12 to-cyan-600/12 blur-3xl animate-blob" />
        <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-violet-600/8 to-blue-600/8 blur-3xl animate-blob-delay" />
      </div>

      <div className="container max-w-3xl text-center relative z-10">
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary mb-6">
            <Sparkles className="h-3 w-3" />
            Get Started Free
          </span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Stop bleeding cash.{' '}
          <span className="gradient-text-bright">Start automating freedom.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Connect your Gmail. Let SubZero do the rest. Setup takes less than 60 seconds.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="px-10 text-base h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-0 shadow-[0_0_40px_hsl(217_91%_60%/0.25)] hover:shadow-[0_0_60px_hsl(217_91%_60%/0.4)] transition-all duration-300 font-semibold">
              <Mail className="mr-2 h-5 w-5" />
              Sync Gmail via Google
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8 text-base h-14 rounded-xl border-white/10 hover:border-white/20">
              Explore Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
        <motion.p variants={fadeIn} className="mt-6 text-xs text-muted-foreground">
          Free forever for up to 20 subscriptions · No credit card required
        </motion.p>
      </div>
    </Section>
  );
}

// ──────────────────────────────────────
// Main Page
// ──────────────────────────────────────

import { MarketingLayout } from '@/components/marketing/layout';

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <MarketingLayout>
      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          id="hero"
          ref={heroRef}
          className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-20 lg:pt-44 grain-overlay"
        >
          {/* Canvas particles */}
          <div className="absolute inset-0 z-0">
            <ParticleBg />
          </div>

          {/* Multi-layer background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(217_91%_60%/0.10),transparent_65%)]" />
            <div className="absolute top-0 right-0 h-[700px] w-[700px] bg-[radial-gradient(circle,hsl(270_60%_60%/0.07),transparent_55%)]" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-[radial-gradient(circle,hsl(185_70%_50%/0.05),transparent_55%)]" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(hsl(215_28%_13%/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(215_28%_13%/0.35)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(222_47%_4%/0.6)_100%)]" />
          </div>

          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="container max-w-7xl relative z-10"
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left: Copy */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="text-center lg:text-left"
              >
                {/* Shimmer badge */}
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-sm text-primary mb-6 shimmer-badge"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">AI-Powered Subscription Intelligence</span>
                  <span className="text-primary/50">✦</span>
                  <span className="text-xs text-primary/70">New</span>
                </motion.div>

                {/* Headline with word cycle */}
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-2"
                >
                  Stop Losing Money to{' '}
                  <br className="hidden sm:block" />
                  <WordCycle />
                </motion.h1>

                <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  SubZero connects to your Gmail, detects every subscription, and shows you exactly where your money goes — all on autopilot.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="px-8 text-base h-13 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-0 shadow-[0_0_30px_hsl(217_91%_60%/0.3)] hover:shadow-[0_0_50px_hsl(217_91%_60%/0.45)] transition-all duration-300 font-semibold"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Sync Gmail via Google
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="px-8 text-base h-13 rounded-xl border-white/10 hover:border-white/20">
                      See How It Works
                    </Button>
                  </Link>
                </motion.div>

                <motion.p variants={fadeIn} className="mt-4 text-xs text-muted-foreground/70">
                  Free forever · No credit card · Setup in 60 seconds
                </motion.p>
              </motion.div>

              {/* Right: Kinetic Sphere */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                className="hidden lg:block"
              >
                <KineticSphere />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ─── SOCIAL PROOF ─── */}
        <SocialProofTicker />

        {/* ─── PROBLEM: Before / After ─── */}
        <ProblemSection />

        {/* ─── STATS ─── */}
        <StatsSection />

        {/* ─── BENTO FEATURES ─── */}
        <div id="features">
          <BentoGrid />
        </div>

        {/* ─── FINAL CTA ─── */}
        <FinalCTA />
      </main>
    </MarketingLayout>
  );
}
