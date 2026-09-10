import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle, XOctagon, Info, RefreshCw, Flame, ChevronDown, ChevronUp, } from "lucide-react";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const CATEGORY_COLORS = {
    Health: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
    Politics: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    Science: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    Celebrity: "bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900",
    Finance: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    Technology: "bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900",
    Viral: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900",
};
const PLATFORM_ICONS = {
    WhatsApp: "💬", Facebook: "📘", "Twitter/X": "🐦", Telegram: "✈️", TikTok: "🎵",
};
function verdictStyle(verdict) {
    if (verdict === "Fake")
        return { icon: XOctagon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" };
    if (verdict === "Misleading")
        return { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" };
    return { icon: Info, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" };
}
function severityDot(severity) {
    if (severity === "High")
        return "bg-red-500";
    if (severity === "Medium")
        return "bg-amber-500";
    return "bg-emerald-500";
}
function StoryCard({ story, index }) {
    const [expanded, setExpanded] = useState(false);
    const { icon: Icon, color, bg } = verdictStyle(story.verdict);
    const catColor = CATEGORY_COLORS[story.category] || "bg-muted text-muted-foreground border-border";
    return (<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }}>
      <Card className="border-border/60 hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-0">
          {/* Top bar */}
          <div className={cn("flex items-center gap-3 px-5 py-3 border-b", bg)}>
            <Icon className={cn("h-4 w-4 shrink-0", color)}/>
            <span className={cn("text-xs font-bold uppercase tracking-wide", color)}>{story.verdict}</span>
            <div className="ml-auto flex items-center gap-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", catColor)}>{story.category}</span>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", severityDot(story.severity))}/>
                <span className="text-xs text-muted-foreground">{story.severity} severity</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Headline */}
            <p className="font-semibold text-foreground mb-3 leading-snug">"{story.headline}"</p>

            {/* Why spreading */}
            <div className="flex items-start gap-2 mb-3">
              <Flame className="h-4 w-4 text-orange-400 shrink-0 mt-0.5"/>
              <p className="text-xs text-muted-foreground">{story.whySpreading}</p>
            </div>

            {/* Platforms */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Spreading on:</span>
              {story.platforms.map((p) => (<span key={p} className="text-xs bg-muted/60 border border-border/60 px-2 py-0.5 rounded-full">
                  {PLATFORM_ICONS[p] || "📱"} {p}
                </span>))}
            </div>

            {/* Expand toggle */}
            <button onClick={() => setExpanded((e) => !e)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              {expanded ? <ChevronUp className="h-3.5 w-3.5"/> : <ChevronDown className="h-3.5 w-3.5"/>}
              {expanded ? "Hide details" : "See the truth + red flags"}
            </button>

            <AnimatePresence>
              {expanded && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">✅ The Truth</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">{story.truth}</p>
                    </div>
                    {story.redFlags.length > 0 && (<div>
                        <p className="text-xs font-bold text-foreground mb-1.5">🚩 Red Flags to Spot</p>
                        <ul className="space-y-1">
                          {story.redFlags.map((f, i) => (<li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="shrink-0">•</span>{f}
                            </li>))}
                        </ul>
                      </div>)}
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>);
}
export default function Trending() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [generatedAt, setGeneratedAt] = useState("");
    const [filter, setFilter] = useState("All");
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/api/trending`);
            if (!res.ok)
                throw new Error("Failed to load");
            const data = await res.json();
            setStories(data.stories || []);
            setGeneratedAt(data.generatedAt || "");
        }
        catch {
            setError("Couldn't load trending stories. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const categories = ["All", ...Array.from(new Set(stories.map((s) => s.category)))];
    const filtered = filter === "All" ? stories : stories.filter((s) => s.category === filter);
    return (<div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-primary"/>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Trending Now</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Viral Misinformation Tracker</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Live-updated list of fake news and misleading stories currently spreading across social media and messaging apps.
        </p>
        {generatedAt && (<p className="text-xs text-muted-foreground/60 mt-2">
            Last updated: {new Date(generatedAt).toLocaleTimeString()}
          </p>)}
      </div>

      {/* Controls */}
      {stories.length > 0 && (<div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (<button key={cat} onClick={() => setFilter(cat)} className={cn("text-xs px-3 py-1.5 rounded-full border transition-all font-medium", filter === cat
                    ? "satya-gradient text-white border-transparent shadow-sm"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted")}>
                {cat}
              </button>))}
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="rounded-lg gap-2">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")}/>
            Refresh
          </Button>
        </div>)}

      {/* Loading */}
      {loading && (<div className="flex flex-col items-center gap-4 py-20">
          <div className="w-16 h-16 rounded-2xl satya-gradient flex items-center justify-center animate-pulse">
            <TrendingUp className="h-8 w-8 text-white"/>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Loading trending misinformation...</p>
            <p className="text-sm text-muted-foreground">AI scanning for viral fake news</p>
          </div>
        </div>)}

      {/* Error */}
      {error && !loading && (<div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={load} variant="outline">Try Again</Button>
        </div>)}

      {/* Stories */}
      {!loading && filtered.length > 0 && (<div className="space-y-4">
          {filtered.map((story, i) => (<StoryCard key={story.id} story={story} index={i}/>))}
        </div>)}

      <p className="text-center text-xs text-muted-foreground/50 mt-8">
        Stories generated by AI based on known misinformation patterns. Always verify with primary sources.
      </p>
    </div>);
}
