import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Zap, BookOpen, BarChart3, ScanSearch, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useStats } from "@/hooks/use-analysis";
import { useEffect, useRef } from "react";
function AnimatedCounter({ value, suffix = "" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
    useEffect(() => {
        if (isInView)
            motionVal.set(value);
    }, [isInView, value, motionVal]);
    useEffect(() => {
        return spring.on("change", (latest) => {
            if (ref.current)
                ref.current.textContent = Math.round(latest) + suffix;
        });
    }, [spring, suffix]);
    return <span ref={ref}>0{suffix}</span>;
}
const features = [
    {
        icon: <Zap className="h-6 w-6 text-violet-500"/>,
        title: "Instant Multi-Modal Analysis",
        desc: "Paste text, URLs, headlines, or upload images. Our dual-AI engine processes content in seconds with deep contextual understanding.",
        color: "from-violet-500/10 to-violet-500/5",
        border: "border-violet-200 dark:border-violet-900"
    },
    {
        icon: <ShieldCheck className="h-6 w-6 text-emerald-500"/>,
        title: "Independent AI Verification",
        desc: "Cross-checks claims using two distinct AI engines — OpenAI GPT and Google Gemini — for unbiased, doubly-verified results.",
        color: "from-emerald-500/10 to-emerald-500/5",
        border: "border-emerald-200 dark:border-emerald-900"
    },
    {
        icon: <BarChart3 className="h-6 w-6 text-blue-500"/>,
        title: "Live Transparency Dashboard",
        desc: "Explore real-time trends, keyword patterns, and misinformation statistics on our fully transparent global analytics panel.",
        color: "from-blue-500/10 to-blue-500/5",
        border: "border-blue-200 dark:border-blue-900"
    },
    {
        icon: <BookOpen className="h-6 w-6 text-orange-500"/>,
        title: "Media Literacy Education",
        desc: "Build critical thinking skills with curated guides on spotting deepfakes, understanding bias, and evaluating sources.",
        color: "from-orange-500/10 to-orange-500/5",
        border: "border-orange-200 dark:border-orange-900"
    }
];
const steps = [
    { num: "01", title: "Submit Content", desc: "Paste text, a URL, a headline, or upload an image for analysis." },
    { num: "02", title: "Dual-AI Evaluation", desc: "OpenAI and Gemini independently analyze the content for credibility." },
    { num: "03", title: "Get Your Verdict", desc: "Receive a clear verdict — Real, Fake, or Misleading — with detailed reasoning." },
];
export default function Home() {
    const { data: stats } = useStats();
    return (<div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center pt-20 pb-16 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/2"/>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-400/8 rounded-full blur-[100px] translate-y-1/3"/>
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit border border-primary/20">
                <ScanSearch className="h-4 w-4"/>
                <span>AI-Powered Fact Verification</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} className="text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">
                Truth Has a<br />
                <span className="satya-text-gradient">New Guardian.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                <strong className="text-foreground font-semibold">SatyaCheck</strong> (<em>Satya</em> = Truth in Sanskrit) uses OpenAI + Gemini AI to instantly classify news, headlines, URLs, and images as Real, Fake, or Misleading.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }} className="flex flex-col sm:flex-row gap-4">
                <Link href="/detect">
                  <Button size="lg" className="h-13 px-8 rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 satya-gradient border-0 text-base font-semibold">
                    Start Analyzing <ArrowRight className="ml-2 h-5 w-5"/>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="h-13 px-8 rounded-full border-2 text-base font-semibold hover:bg-muted transition-all duration-300">
                    Live Dashboard
                  </Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.36 }} className="flex items-center gap-6 pt-2">
                {[
            { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500"/>, label: "No API key needed" },
            { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500"/>, label: "Dual AI verification" },
            { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500"/>, label: "Instant results" },
        ].map((item, i) => (<div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="satya-gradient rounded-3xl p-0.5 shadow-2xl shadow-primary/20">
                  <div className="bg-card rounded-3xl p-8 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Verdict</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"/>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"/>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                      <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0"/>
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">VERIFIED REAL</p>
                        <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70">94% confidence score</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary"/>
                        <span>OpenAI analysis complete</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-violet-500"/>
                        <span>Gemini verification: Agrees</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground leading-relaxed">
                      "Sources corroborated. Factual claims verified against multiple databases. No signs of manipulation or bias detected."
                    </div>
                  </div>
                </div>
                {/* Decorative floating badges */}
                <div className="absolute -top-4 -right-6 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg text-sm font-semibold text-destructive flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive inline-block"/>
                  Fake detected
                </div>
                <div className="absolute -bottom-4 -left-6 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg text-sm font-semibold text-warning flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning inline-block"/>
                  Misleading content
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      {stats && stats.total > 0 && (<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="py-6 border-y border-border/50 bg-muted/20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                <span className="text-sm text-muted-foreground font-medium">Live platform data</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold satya-text-gradient">
                  <AnimatedCounter value={stats.total}/>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Activity className="h-3 w-3"/>Total analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  <AnimatedCounter value={stats.realCount}/>
                </div>
                <div className="text-xs text-muted-foreground">Verified real</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  <AnimatedCounter value={stats.fakeCount}/>
                </div>
                <div className="text-xs text-muted-foreground">Detected fake</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  <AnimatedCounter value={stats.misleadingCount}/>
                </div>
                <div className="text-xs text-muted-foreground">Misleading</div>
              </div>
            </div>
          </div>
        </motion.section>)}

      {/* How it works */}
      <section className="py-24 bg-muted/30 border-y border-border/50 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Three steps to the truth</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (<motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl satya-gradient flex items-center justify-center text-white font-bold text-xl font-serif shadow-lg shadow-primary/20">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 block">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Comprehensive truth detection</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A multi-layered approach to ensure the highest accuracy in identifying and explaining misinformation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Card className={`h-full border ${feature.border} bg-gradient-to-br ${feature.color} hover:shadow-xl transition-all duration-300 group`}>
                  <CardContent className="p-8 flex gap-5">
                    <div className="p-3 rounded-xl bg-background/70 shadow-sm h-fit group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* SDG Banner */}
      <section className="py-16 px-4 bg-muted/20 border-y border-border/50">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Aligned with UN SDGs</span>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
            { num: "04", label: "Quality Education" },
            { num: "09", label: "Innovation" },
            { num: "10", label: "Reduced Inequalities" },
            { num: "16", label: "Peace & Justice" },
        ].map((sdg) => (<div key={sdg.num} className="flex flex-col items-center gap-2">
                <img src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${sdg.num}.jpg`} alt={sdg.label} className="h-16 w-16 rounded-xl shadow-md hover:scale-110 transition-transform duration-300 cursor-default"/>
                <span className="text-xs text-muted-foreground font-medium">{sdg.label}</span>
              </div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-3xl overflow-hidden satya-gradient p-[1px] shadow-2xl shadow-primary/25">
            <div className="bg-card rounded-3xl px-10 py-16 md:px-20 text-center flex flex-col items-center gap-8">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/5)_1px,transparent_1px)] bg-[size:3rem_3rem]"/>
              <div className="relative z-10 space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Ready to find the truth?</h2>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Join thousands of journalists, educators, and citizens using SatyaCheck to fight back against digital misinformation.
                </p>
              </div>
              <Link href="/detect" className="relative z-10">
                <Button size="lg" className="h-13 px-10 rounded-full text-base font-bold hover:scale-105 transition-transform duration-300 satya-gradient border-0 shadow-lg hover:shadow-xl hover:shadow-primary/30">
                  Start Fact-Checking Free <ArrowRight className="ml-2 h-5 w-5"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>);
}
