'use client';

import Link from 'next/link';
import { useRef } from 'react';
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
// Kinetic Data Sphere (CSS 3D)
// ──────────────────────────────────────

function KineticSphere() {
  return (
    <div className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px] mx-auto animate-float">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/20 blur-3xl" />

      {/* Orbit ring 1 */}
      <div className="absolute inset-4 rounded-full border border-blue-500/20 animate-orbit">
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-blue-400 shadow-[0_0_15px_hsl(217_91%_60%/0.6)]" />
        <div className="absolute -bottom-1 right-10 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_hsl(185_70%_50%/0.6)]" />
      </div>

      {/* Orbit ring 2 */}
      <div className="absolute inset-12 rounded-full border border-purple-500/15 animate-orbit-reverse">
        <div className="absolute top-4 -right-1 h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_hsl(270_60%_60%/0.6)]" />
        <div className="absolute bottom-6 -left-1 h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_10px_hsl(210_90%_70%/0.6)]" />
      </div>

      {/* Core sphere */}
      <div className="absolute inset-20 md:inset-24 rounded-full bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-cyan-600/30 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_hsl(217_91%_60%/0.15)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold gradient-text-bright">₹0</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 tracking-widest uppercase">wasted</p>
          </div>
        </div>
      </div>

      {/* Floating data points */}
      <div className="absolute top-[15%] right-[5%] glass rounded-lg px-3 py-1.5 text-xs animate-pulse-glow">
        <span className="text-emerald-400 font-semibold">−₹899</span>
        <span className="text-muted-foreground ml-1">saved</span>
      </div>
      <div className="absolute bottom-[18%] left-[2%] glass rounded-lg px-3 py-1.5 text-xs animate-pulse-glow" style={{ animationDelay: '1s' }}>
        <span className="text-blue-400 font-semibold">AI</span>
        <span className="text-muted-foreground ml-1">detected 3</span>
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
  'PhonePe', 'CRED', 'Paytm', 'Groww',
];

function SocialProofTicker() {
  return (
    <Section className="border-y border-border/30 py-6 overflow-hidden bg-card/20">
      <motion.div variants={fadeIn} className="text-center mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by employees at
        </p>
      </motion.div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...companies, ...companies].map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="mx-8 text-sm font-medium text-muted-foreground/60 select-none"
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
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">The Problem</p>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
            You&apos;re paying for things you{' '}
            <span className="gradient-text">don&apos;t even remember</span>
          </h2>
        </motion.div>

        {/* Before / After split */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* BEFORE */}
          <motion.div variants={fadeUp} className="relative rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 md:p-8">
            <div className="absolute -top-3 left-6 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/30">
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
            <div className="mt-6 text-center">
              <p className="text-3xl font-bold text-red-400">−₹12,000</p>
              <p className="text-xs text-muted-foreground mt-1">wasted per year</p>
            </div>
          </motion.div>

          {/* AFTER */}
          <motion.div variants={fadeUp} className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 md:p-8">
            <div className="absolute -top-3 left-6 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
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
            <div className="mt-6 text-center">
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
// Bento Grid Features
// ──────────────────────────────────────

const features = [
  {
    icon: Scan,
    title: 'AI Receipt Parsing',
    description: 'Our AI reads your email receipts and extracts subscription data automatically — no manual entry ever.',
    span: 'md:col-span-2',
    glow: 'glow-primary',
  },
  {
    icon: Copy,
    title: 'Duplicate Detection',
    description: 'Instantly spots overlapping services like two cloud storage or streaming plans.',
    span: '',
    glow: 'glow-accent',
  },
  {
    icon: Flame,
    title: 'Future Burn Forecast',
    description: 'Projects your 3, 6, and 12-month subscription spending so you can plan ahead.',
    span: '',
    glow: 'glow-cyan',
  },
  {
    icon: Eye,
    title: 'Zero-Touch Sync',
    description: 'Connect Gmail once. SubZero monitors for new subscriptions automatically.',
    span: '',
    glow: 'glow-primary',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'End-to-end encryption. OAuth only — we never store your email password.',
    span: 'md:col-span-2',
    glow: 'glow-accent',
  },
];

function BentoGrid() {
  return (
    <Section className="py-20 md:py-28 bg-card/20 border-y border-border/30">
      <div className="container max-w-6xl">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
            Everything runs on{' '}
            <span className="gradient-text">autopilot</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Six intelligent engines working behind the scenes so you never waste a rupee again.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div
              variants={fadeUp}
              key={f.title}
              className={`group glass glass-hover rounded-2xl p-6 md:p-8 ${f.span} relative overflow-hidden`}
            >
              {/* Subtle corner glow on hover */}
              <div className={`absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl ${f.glow === 'glow-primary' ? 'bg-blue-500/10' :
                f.glow === 'glow-accent' ? 'bg-purple-500/10' : 'bg-cyan-500/10'
                }`} />

              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.glow === 'glow-primary' ? 'bg-blue-500/10' :
                f.glow === 'glow-accent' ? 'bg-purple-500/10' : 'bg-cyan-500/10'
                } mb-4`}>
                <f.icon className={`h-6 w-6 ${f.glow === 'glow-primary' ? 'text-blue-400' :
                  f.glow === 'glow-accent' ? 'text-purple-400' : 'text-cyan-400'
                  }`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ──────────────────────────────────────
// Stats Counter Section
// ──────────────────────────────────────

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const stats = [
    { value: '50,000+', label: 'Subscriptions Tracked' },
    { value: '₹4.2 Cr', label: 'Saved for Users' },
    { value: '99.2%', label: 'AI Detection Rate' },
    { value: '<60s', label: 'Setup Time' },
  ];

  return (
    <section ref={ref} className="py-16 md:py-20">
      <div className="container max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text-bright">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
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
    <Section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] md:h-[700px] md:w-[700px] rounded-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 blur-3xl" />
      </div>

      <div className="container max-w-3xl text-center">
        <motion.div variants={fadeUp}>
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Get Started</p>
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
            <Button size="lg" className="px-10 text-base h-14 rounded-xl glow-primary hover:shadow-[0_0_40px_hsl(217_91%_60%/0.3)] transition-shadow duration-300">
              <Mail className="mr-2 h-5 w-5" />
              Sync Gmail via Google
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8 text-base h-14 rounded-xl">
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <MarketingLayout>
      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section id="hero" ref={heroRef} className="relative overflow-hidden pt-16 pb-8 md:pt-24 md:pb-16 lg:pt-32">
          {/* Multi-layer background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(217_91%_60%/0.08),transparent_70%)]" />
            <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-[radial-gradient(circle,hsl(270_60%_60%/0.06),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-[radial-gradient(circle,hsl(185_70%_50%/0.04),transparent_60%)]" />
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(hsl(215_28%_13%/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(215_28%_13%/0.4)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          </div>

          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="container max-w-7xl"
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left: Copy */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="text-center lg:text-left"
              >
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Powered Subscription Intelligence
                </motion.div>

                <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-7xl font-extrabold tracking-tight leading-[1.1]">
                  Stop Bleeding Cash.{' '}
                  <span className="gradient-text-bright">Start Automating Freedom.</span>
                </motion.h1>

                <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  SubZero connects to your Gmail, detects every subscription, and shows you exactly where your money goes — all on autopilot.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="px-8 text-base h-13 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 glow-primary hover:shadow-[0_0_40px_hsl(217_91%_60%/0.3)] transition-all duration-300">
                      <Mail className="mr-2 h-5 w-5" />
                      Sync Gmail via Google
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline" className="px-8 text-base h-13 rounded-xl">
                      See How It Works
                    </Button>
                  </Link>
                </motion.div>

                <motion.p variants={fadeIn} className="mt-4 text-xs text-muted-foreground">
                  Free forever · No credit card · Setup in 60 seconds
                </motion.p>
              </motion.div>

              {/* Right: Kinetic Sphere */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
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
