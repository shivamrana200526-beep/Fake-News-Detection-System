import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, Globe, Loader2, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Info, Sparkles, } from "lucide-react";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const EXAMPLE_SOURCES = ["bbc.com", "reuters.com", "breitbart.com", "theonion.com", "apnews.com", "infowars.com"];
function trustColor(score) {
    if (score >= 75)
        return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-900", card: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" };
    if (score >= 50)
        return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", ring: "ring-amber-200 dark:ring-amber-900", card: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" };
    return { text: "text-red-600 dark:text-red-400", bg: "bg-red-500", ring: "ring-red-200 dark:ring-red-900", card: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" };
}
function biasColor(bias) {
    const b = bias?.toLowerCase() || "";
    if (b.includes("far left") || b.includes("extreme left"))
        return "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/30";
    if (b.includes("center-left") || b.includes("left"))
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
    if (b.includes("center"))
        return "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800";
    if (b.includes("center-right") || b.includes("right"))
        return "text-red-500 bg-red-50 dark:bg-red-950/20";
    if (b.includes("far right") || b.includes("extreme right"))
        return "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/30";
    return "text-muted-foreground bg-muted";
}
function ratingIcon(rating) {
    const r = rating?.toLowerCase() || "";
    if (r.includes("highly reliable"))
        return <CheckCircle2 className="h-4 w-4 text-emerald-500"/>;
    if (r.includes("generally reliable"))
        return <CheckCircle2 className="h-4 w-4 text-green-400"/>;
    if (r.includes("mixed"))
        return <AlertTriangle className="h-4 w-4 text-amber-500"/>;
    if (r.includes("unreliable"))
        return <XCircle className="h-4 w-4 text-red-500"/>;
    if (r.includes("satire"))
        return <Info className="h-4 w-4 text-blue-400"/>;
    return <HelpCircle className="h-4 w-4 text-muted-foreground"/>;
}
function TrustGauge({ score }) {
    const colors = trustColor(score);
    const angle = (score / 100) * 180 - 90;
    return (<div className="flex flex-col items-center gap-2">
      <div className={cn("relative w-36 h-18 flex items-end justify-center")}>
        <svg width="144" height="80" viewBox="0 0 144 80">
          <path d="M 12 72 A 60 60 0 0 1 132 72" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-border/30"/>
          <path d="M 12 72 A 60 60 0 0 1 132 72" fill="none" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * 188} 188`} className={cn(score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500")}/>
          <circle cx={72 + 60 * Math.cos(((angle - 90) * Math.PI) / 180)} cy={72 + 60 * Math.sin(((angle - 90) * Math.PI) / 180)} r="7" className={cn("fill-background stroke-2", score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500")}/>
        </svg>
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={cn("text-3xl font-black tabular-nums", colors.text)}>{score}</span>
          <span className="text-xs text-muted-foreground -mt-1">/ 100</span>
        </div>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>0</span>
        <div className="flex-1 flex">
          <div className="h-1 flex-1 rounded-l-full bg-red-400/40"/>
          <div className="h-1 flex-1 bg-amber-400/40"/>
          <div className="h-1 flex-1 rounded-r-full bg-emerald-400/40"/>
        </div>
        <span>100</span>
      </div>
    </div>);
}
export default function Credibility() {
    const [source, setSource] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const check = async (s) => {
        const val = (s ?? source).trim();
        if (!val)
            return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch(`${BASE_URL}/api/credibility`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source: val }),
            });
            if (!res.ok)
                throw new Error((await res.json()).message || "Failed");
            setResult(await res.json());
        }
        catch (e) {
            setError(e.message || "Analysis failed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    const colors = result ? trustColor(result.trustScore) : null;
    return (<div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-primary"/>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Source Index</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Domain & Source Credibility Index</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Evaluate news domains and publishers for historical factual reliability, bias tendencies, and ownership transparency.
        </p>
      </div>

      {/* Input */}
      <Card className="border-border shadow-xs mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input value={source} onChange={(e) => setSource(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="e.g. reuters.com, bbc.com, theonion.com" className="pl-10 h-10 border-border text-sm rounded-md"/>
            </div>
            <Button onClick={() => check()} disabled={loading || !source.trim()} className="h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md shadow-xs">
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Inspect Domain"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[11px] text-muted-foreground font-medium mr-1">Sample domains:</span>
            {EXAMPLE_SOURCES.map((s) => (<button key={s} onClick={() => { setSource(s); check(s); }} className="text-xs px-2.5 py-0.5 rounded border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors font-mono">
                {s}
              </button>))}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (<div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-6">
          {error}
        </div>)}

      {/* Loading */}
      {loading && (<div className="flex flex-col items-center gap-4 py-16">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl satya-gradient flex items-center justify-center animate-pulse">
              <Globe className="h-8 w-8 text-white"/>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Analyzing source credibility...</p>
            <p className="text-sm text-muted-foreground">Cross-referencing with GPT-5 & Gemini</p>
          </div>
        </div>)}

      {/* Result */}
      <AnimatePresence>
        {result && colors && (<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Score card */}
            <Card className={cn("border mb-4 shadow-lg overflow-hidden", colors.card)}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <TrustGauge score={result.trustScore}/>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      {result.trustScore >= 75 ? (<ShieldCheck className={cn("h-5 w-5", colors.text)}/>) : result.trustScore >= 50 ? (<ShieldAlert className={cn("h-5 w-5", colors.text)}/>) : (<ShieldX className={cn("h-5 w-5", colors.text)}/>)}
                      <span className={cn("text-xl font-black", colors.text)}>
                        {result.trustScore >= 75 ? "Highly Credible" : result.trustScore >= 50 ? "Mixed Credibility" : "Low Credibility"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{result.name || result.domain}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{result.domain}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", biasColor(result.bias))}>
                        {result.bias} Bias
                      </span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full border border-border bg-background/60 text-foreground">
                        {result.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border border-border bg-background/60 text-foreground">
                        {ratingIcon(result.factCheckRating)}
                        {result.factCheckRating}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/60 mb-4">
              <CardContent className="p-5">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary"/> About This Source
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Red flags */}
              {result.redFlags.length > 0 && (<Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4"/> Red Flags
                    </h3>
                    <ul className="space-y-1">
                      {result.redFlags.map((f, i) => (<li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">⚠</span>{f}
                        </li>))}
                    </ul>
                  </CardContent>
                </Card>)}

              {/* Positives */}
              {result.positives.length > 0 && (<Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4"/> Strengths
                    </h3>
                    <ul className="space-y-1">
                      {result.positives.map((p, i) => (<li key={i} className="text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">✓</span>{p}
                        </li>))}
                    </ul>
                  </CardContent>
                </Card>)}
            </div>

            {/* Recommendation */}
            <Card className="border-border/60 bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">💡 Recommendation: </span>
                  {result.recommendation}
                </p>
              </CardContent>
            </Card>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
