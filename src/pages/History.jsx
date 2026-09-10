import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { History as HistoryIcon, ShieldCheck, AlertTriangle, XOctagon, HelpCircle, Trash2, Download, Search, Clock, BarChart3, } from "lucide-react";
import { Link } from "wouter";
const STORAGE_KEY = "satyacheck_history";
export function saveToHistory(entry) {
    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        const newEntry = {
            ...entry,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
        };
        const updated = [newEntry, ...existing].slice(0, 100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    catch { }
}
function verdictMeta(verdict) {
    const v = (verdict || "").toLowerCase();
    if (v === "real")
        return { Icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500", label: "Real", emoji: "✅" };
    if (v === "fake")
        return { Icon: XOctagon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800", dot: "bg-red-500", label: "Fake", emoji: "❌" };
    if (v === "misleading")
        return { Icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", dot: "bg-amber-500", label: "Misleading", emoji: "⚠️" };
    return { Icon: HelpCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800", dot: "bg-blue-400", label: "Unverifiable", emoji: "🔍" };
}
function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60)
        return "just now";
    if (diff < 3600)
        return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)
        return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}
function typeLabel(type) {
    return type === "url" ? "URL" : type === "headline" ? "Headline" : type === "image" ? "Image" : "Text";
}
export default function History() {
    const [entries, setEntries] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            setEntries(data);
        }
        catch {
            setEntries([]);
        }
    }, []);
    const filtered = entries.filter((e) => {
        const matchSearch = e.content.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "All" || e.verdict?.toLowerCase() === filter.toLowerCase();
        return matchSearch && matchFilter;
    });
    const stats = {
        total: entries.length,
        real: entries.filter((e) => e.verdict?.toLowerCase() === "real").length,
        fake: entries.filter((e) => e.verdict?.toLowerCase() === "fake").length,
        misleading: entries.filter((e) => e.verdict?.toLowerCase() === "misleading").length,
    };
    const clearAll = () => {
        if (!confirm("Clear all history? This cannot be undone."))
            return;
        localStorage.removeItem(STORAGE_KEY);
        setEntries([]);
    };
    const removeOne = (id) => {
        const updated = entries.filter((e) => e.id !== id);
        setEntries(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };
    const exportCSV = () => {
        const rows = [
            ["Date", "Type", "Content", "Verdict", "Confidence"],
            ...entries.map((e) => [
                new Date(e.timestamp).toLocaleString(),
                typeLabel(e.type),
                e.content.replace(/,/g, ";").substring(0, 200),
                e.verdict,
                e.confidence?.toString() || "",
            ]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "satyacheck-history.csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    return (<div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <HistoryIcon className="h-5 w-5 text-primary"/>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">History</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Your Past Checks</h1>
        <p className="text-muted-foreground">Every fact-check you've run — saved locally in your browser.</p>
      </div>

      {/* Stats */}
      {entries.length > 0 && (<div className="grid grid-cols-4 gap-3 mb-6">
          {[
                { label: "Total", value: stats.total, color: "text-foreground", dot: "bg-primary" },
                { label: "Real", value: stats.real, color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
                { label: "Fake", value: stats.fake, color: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
                { label: "Misleading", value: stats.misleading, color: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
            ].map((s) => (<Card key={s.label} className="border-border/60">
              <CardContent className="p-3 text-center">
                <div className={cn("text-2xl font-black", s.color)}>{s.value}</div>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <div className={cn("w-2 h-2 rounded-full", s.dot)}/>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              </CardContent>
            </Card>))}
        </div>)}

      {/* Controls */}
      {entries.length > 0 && (<div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..." className="pl-10 h-9 border-border/60"/>
          </div>
          <div className="flex gap-1.5">
            {["All", "Real", "Fake", "Misleading"].map((f) => (<button key={f} onClick={() => setFilter(f)} className={cn("text-xs px-3 py-1.5 rounded-full border font-medium transition-all", filter === f ? "satya-gradient text-white border-transparent" : "border-border bg-muted/40 text-muted-foreground hover:bg-muted")}>
                {f}
              </button>))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 rounded-lg h-9">
              <Download className="h-3.5 w-3.5"/> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg h-9">
              <Trash2 className="h-3.5 w-3.5"/> Clear All
            </Button>
          </div>
        </div>)}

      {/* Empty state */}
      {entries.length === 0 && (<div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground"/>
          </div>
          <h3 className="font-semibold text-foreground mb-2">No checks yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Start fact-checking content and your results will appear here automatically.</p>
          <Link href="/detect">
            <Button className="satya-gradient border-0 rounded-full">Start Analyzing</Button>
          </Link>
        </div>)}

      {/* Entries list */}
      {entries.length > 0 && filtered.length === 0 && (<div className="text-center py-12 text-muted-foreground">No results match your search.</div>)}

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((entry, i) => {
            const { Icon, color, bg, dot, label, emoji } = verdictMeta(entry.verdict);
            return (<motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                <Card className="border-border/60 hover:shadow-sm transition-shadow group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border", bg)}>
                        <Icon className={cn("h-4 w-4", color)}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs font-bold", color)}>{emoji} {label}</span>
                          {entry.confidence !== undefined && (<span className="text-xs text-muted-foreground">{entry.confidence}%</span>)}
                          <span className="text-xs border border-border/60 bg-muted/40 px-2 py-0.5 rounded-full text-muted-foreground">{typeLabel(entry.type)}</span>
                          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3"/>{formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2 leading-snug">{entry.content}</p>
                        {entry.explanation && (<p className="text-xs text-muted-foreground mt-1 line-clamp-1">{entry.explanation}</p>)}
                      </div>
                      <button onClick={() => removeOne(entry.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 shrink-0">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>);
        })}
        </AnimatePresence>
      </div>
    </div>);
}
