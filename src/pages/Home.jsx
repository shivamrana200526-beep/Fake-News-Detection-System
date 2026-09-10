import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, ShieldCheck, Zap, BookOpen, BarChart3,
  ScanSearch, CheckCircle2, TrendingUp, Activity, FileText,
  AlertTriangle, Check, ShieldAlert, Globe, MessageSquare
} from "lucide-react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useStats } from "@/hooks/use-analysis";
import { useEffect, useRef } from "react";

function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = Math.round(latest) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const disciplines = [
  {
    icon: <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    title: "Multi-Modal Claim Ingestion",
    desc: "Submit raw text, full article URLs, headlines, or uploaded screenshots. The system extracts core factual propositions for independent verification.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    title: "Forensic Evidence Corroboration",
    desc: "Cross-references claims against historical databases, accredited news archives, and primary sources with verifiable citations.",
  },
  {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    title: "Manipulation & Bias Diagnostics",
    desc: "Flags emotional appeals, false urgency, cherry-picked context, and specific logical fallacies designed to deceive.",
  },
  {
    icon: <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    title: "Domain Credibility Index",
    desc: "Inspects publisher ownership, editorial corrections policy, and historical transparency ratings for thousands of news outlets.",
  },
];

const methodologySteps = [
  {
    num: "01",
    title: "Submit & Parse",
    desc: "Paste an article, headline, message, or image. The parser isolates discrete, testable factual assertions.",
  },
  {
    num: "02",
    title: "Forensic Analysis",
    desc: "Each claim is evaluated across 10 forensic dimensions including source authority, timeline coherence, and emotional framing.",
  },
  {
    num: "03",
    title: "Auditable Verdict",
    desc: "Receive a calibrated verdict — Real, Fake, or Misleading — accompanied by verified counter-evidence and source links.",
  },
];

export default function Home() {
  const { data: stats } = useStats();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative border-b border-border/70 bg-gradient-to-b from-background to-muted/20 pt-16 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left copy */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted text-foreground/80 text-xs font-medium border border-border w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span>Open-Access Fact-Checking & Media Literacy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.12]">
                Verify news, claims, and media in real time.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                <strong>SatyaCheck</strong> provides multi-dimensional forensic analysis to detect misinformation, viral hoaxes, and manipulated content. Built to empower researchers, journalists, and everyday citizens.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/detect">
                  <Button size="lg" className="h-11 px-6 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-2">
                    Verify Content <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-11 px-6 rounded-md font-medium text-sm hover:bg-muted">
                    Explore Live Data
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Text, URLs & Screenshots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>10 Forensic Dimensions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Auditable Evidence Citations</span>
                </div>
              </div>
            </div>

            {/* Right Dossier Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo-mark.png" alt="SatyaCheck" className="h-4 w-auto object-contain" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-foreground/80">Forensic Dossier #SC-8924</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
                    Verified Real
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Claim Inspected</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      "Global renewable energy capacity expanded by a record 50% in the latest annual report."
                    </p>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded bg-muted/40 border border-border/60">
                      <p className="text-[11px] text-muted-foreground">Confidence Metric</p>
                      <p className="text-lg font-bold text-foreground">94% <span className="text-xs text-emerald-600 font-medium">(High)</span></p>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40 border border-border/60">
                      <p className="text-[11px] text-muted-foreground">Manipulation Score</p>
                      <p className="text-lg font-bold text-foreground">04 <span className="text-xs text-muted-foreground font-normal">/ 100</span></p>
                    </div>
                  </div>

                  {/* Fact breakdown items */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <p className="text-xs font-medium text-foreground">Forensic Breakdown</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Corroborated by the International Energy Agency (IEA) official bulletin.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>Headline accurately reflects body context without sensationalist phrasing.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>No logical fallacies or emotional persuasion tactics identified.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/60 flex items-center justify-between">
                    <span>Source: Verified International Agency</span>
                    <Link href="/detect" className="text-primary hover:underline font-medium">
                      Test a new claim →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Platform Data Ticker */}
      {stats && stats.total > 0 && (
        <section className="border-b border-border bg-card py-4 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Verification Wire
                </span>
              </div>

              <div className="flex items-center gap-8 sm:gap-12 flex-wrap text-sm">
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">Total Ingested:</span>
                  <span className="font-bold text-foreground font-mono">
                    <AnimatedCounter value={stats.total} />
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">Confirmed Real:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    <AnimatedCounter value={stats.realCount} />
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">Identified Fake:</span>
                  <span className="font-bold text-red-600 dark:text-red-400 font-mono">
                    <AnimatedCounter value={stats.fakeCount} />
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground mr-1.5">Misleading Context:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    <AnimatedCounter value={stats.misleadingCount} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Methodology: Three steps */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/30 border-b border-border/70">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              A structured, evidence-based verification standard.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {methodologySteps.map((step) => (
              <div key={step.num} className="bg-card border border-border rounded-lg p-6 space-y-3">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground inline-block">
                  Stage {step.num}
                </span>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Disciplines */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Forensic tools designed for complex media.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {disciplines.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 flex gap-4 hover:border-border/80 transition-colors">
                <div className="p-2.5 rounded bg-muted h-fit shrink-0 border border-border/60">
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Standards & UN SDGs */}
      <section className="py-12 px-4 md:px-6 bg-muted/20 border-y border-border/70">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Aligned with Global Public Information Standards
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SatyaCheck supports open access to credible information and media literacy principles in alignment with UN Sustainable Development Goals 4 (Quality Education), 9 (Innovation), 10 (Reduced Inequalities), and 16 (Peace, Justice & Strong Institutions).
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-slate-900 text-white rounded-lg p-8 md:p-12 text-center space-y-6 border border-slate-800 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">
              Check a claim before you share it.
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Verify viral messages, suspicious headlines, and questionable assertions with transparent, forensic citations.
            </p>
            <div className="pt-2">
              <Link href="/detect">
                <Button size="lg" className="h-11 px-8 rounded-md font-medium text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs gap-2">
                  Launch Verification Tool <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
