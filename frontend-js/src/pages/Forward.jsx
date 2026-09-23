import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, Loader2, ShieldCheck, AlertTriangle, XOctagon, HelpCircle, Share2, Check, Sparkles, } from "lucide-react";
import { useAnalyzeContent } from "@/hooks/use-analysis";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const EXAMPLE_MESSAGES = [
    "URGENT: Scientists have CONFIRMED that drinking warm lemon water every morning cures cancer! Share this before they delete it! 🍋 Forwarded many times",
    "BREAKING: Government to shut down all internet for 48 hours next week for 'security maintenance'. Stock up on data now! Forwarded",
    "Important message: NASA has confirmed that next Tuesday the earth will experience 6 minutes of total darkness due to a solar eclipse alignment. Turn off all electrical appliances. Please share before it's deleted.",
];
function stripForwardingNoise(text) {
    return text
        .replace(/^(forwarded|fwd|fw):?\s*/im, "")
        .replace(/forwarded \d+ times?\.?/gi, "")
        .replace(/\bforwarded\b/gi, "")
        .replace(/please (share|forward) (this|before|now|immediately).*/gi, "")
        .replace(/share this before (it'?s?|they) (deleted?|removed?).*/gi, "")
        .trim();
}
function verdictMeta(verdict) {
    const v = verdict?.toLowerCase() || "";
    if (v === "real")
        return { Icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", label: "REAL", emoji: "✅" };
    if (v === "fake")
        return { Icon: XOctagon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800", label: "FAKE", emoji: "❌" };
    if (v === "misleading")
        return { Icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", label: "MISLEADING", emoji: "⚠️" };
    return { Icon: HelpCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800", label: "UNVERIFIABLE", emoji: "🔍" };
}
function detectForwardingSignals(text) {
    const signals = [];
    if (/forwarded/i.test(text))
        signals.push("Contains 'Forwarded' label");
    if (/urgent|breaking|important/i.test(text))
        signals.push("Uses urgency language (URGENT / BREAKING)");
    if (/share|forward|send to everyone/i.test(text))
        signals.push("Pressures you to share immediately");
    if (/before (it'?s?|they) (deleted?|removed?)/i.test(text))
        signals.push("Claims it will be deleted — manipulation tactic");
    if (/government|they don't want you to know|mainstream media won't tell/i.test(text))
        signals.push("Anti-establishment framing");
    if (/doctor|scientist|expert|nasa|who|cdc/i.test(text))
        signals.push("Claims authority without verifiable source");
    if (/cure|guaranteed|100%|proven/i.test(text))
        signals.push("Absolute language — real science is rarely 100%");
    return signals;
}
export default function Forward() {
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);
    const { mutate, isPending, data: result, reset } = useAnalyzeContent();
    const signals = detectForwardingSignals(message);
    const cleaned = stripForwardingNoise(message);
    const analyze = () => {
        if (!cleaned.trim())
            return;
        mutate({ data: { content: cleaned, type: "text" } });
    };
    const shareCorrection = () => {
        if (!result)
            return;
        const text = `SatyaCheck says: This forwarded message is ${result.prediction?.toUpperCase() || "UNVERIFIABLE"}.\n\n${result.explanation?.substring(0, 200)}...\n\nCheck any claim at SatyaCheck.`;
        if (navigator.share) {
            navigator.share({ title: "SatyaCheck Fact-Check", text });
        }
        else {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const meta = result ? verdictMeta(result.prediction) : null;
    return (<div className="container mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-primary"/>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Forward Checker</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Inspect a Forwarded Message</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Paste any viral message received on WhatsApp, Telegram, or social media for instant claim verification.
        </p>
      </div>

      {/* Input card */}
      <Card className="border-border shadow-xs mb-5">
        <CardContent className="p-5">
          {/* WhatsApp-like header */}
          <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white"/>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Messaging App & SMS Ingestion</p>
              <p className="text-[11px] text-muted-foreground">Strips forwarding noise and evaluates claims</p>
            </div>
          </div>

          <Textarea value={message} onChange={(e) => { setMessage(e.target.value); if (result)
        reset(); }} placeholder="Paste the forwarded message here... e.g. 'URGENT: Scientists confirm that...' or any viral claim you received" className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[110px] bg-transparent text-sm p-0" rows={4}/>

          {/* Forwarding signals live detector */}
          <AnimatePresence>
            {message.length > 20 && signals.length > 0 && !result && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                    ⚠️ {signals.length} rhetorical red flag{signals.length > 1 ? "s" : ""} detected:
                  </p>
                  <ul className="space-y-1">
                    {signals.map((s, i) => (<li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>{s}
                      </li>))}
                  </ul>
                </div>
              </motion.div>)}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-mono">{message.length} chars</span>
            <Button onClick={analyze} disabled={isPending || !cleaned.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md gap-2 shadow-xs text-xs h-9 font-medium">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
              {isPending ? "Analyzing..." : "Inspect Forward"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example messages */}
      {!result && !isPending && (<div className="mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Try with an example:</p>
          <div className="space-y-2">
            {EXAMPLE_MESSAGES.map((ex, i) => (<button key={i} onClick={() => setMessage(ex)} className="w-full text-left text-xs p-3 rounded-xl bg-muted/40 border border-border hover:bg-primary/5 hover:border-primary/30 transition-all text-muted-foreground hover:text-foreground line-clamp-2">
                {ex}
              </button>))}
          </div>
        </div>)}

      {/* Result */}
      <AnimatePresence>
        {result && meta && (<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Verdict banner */}
            <div className={cn("rounded-2xl border p-5 mb-4 shadow-lg", meta.bg)}>
              <div className="flex items-center gap-3 mb-3">
                <meta.Icon className={cn("h-6 w-6", meta.color)}/>
                <div>
                  <p className={cn("text-xl font-black", meta.color)}>{meta.emoji} {meta.label}</p>
                  <p className="text-xs text-muted-foreground">This forwarded message is {meta.label.toLowerCase()}</p>
                </div>
                {result.confidence !== undefined && (<div className="ml-auto text-right">
                    <p className={cn("text-2xl font-black", meta.color)}>{result.confidence}%</p>
                    <p className="text-xs text-muted-foreground">confidence</p>
                  </div>)}
              </div>

              {/* Confidence bar */}
              {result.confidence !== undefined && (<div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", meta.label === "REAL" ? "bg-emerald-500" : meta.label === "FAKE" ? "bg-red-500" : meta.label === "MISLEADING" ? "bg-amber-500" : "bg-blue-400")}/>
                </div>)}
            </div>

            {/* Explanation */}
            {result.explanation && (<Card className="border-border/60 mb-4">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary"/> AI Explanation
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
                </CardContent>
              </Card>)}

            {/* Key points */}
            {(result.keyPoints && result.keyPoints.length > 0) && (<Card className="border-border/60 mb-4">
                <CardContent className="p-5">
                  <h3 className="font-bold text-foreground mb-2">Key Findings</h3>
                  <ul className="space-y-1.5">
                    {result.keyPoints.map((point, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>{point}
                      </li>))}
                  </ul>
                </CardContent>
              </Card>)}

            {/* Share correction */}
            <div className="flex gap-3">
              <Button onClick={shareCorrection} variant="outline" className="flex-1 rounded-xl gap-2">
                {copied ? <><Check className="h-4 w-4 text-emerald-500"/>Copied!</> : <><Share2 className="h-4 w-4"/>Share Correction</>}
              </Button>
              <Button onClick={() => { setMessage(""); reset(); }} variant="ghost" className="rounded-xl">
                Check Another
              </Button>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
