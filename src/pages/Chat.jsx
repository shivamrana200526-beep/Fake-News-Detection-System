import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Bot, User, Sparkles, Mic, MicOff, RefreshCw, Copy, Check, ShieldCheck, AlertTriangle, XOctagon, HelpCircle, Zap, Search, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/use-voice-input";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
// ── Helpers ──────────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
    "Is it true that 5G towers cause COVID-19?",
    "Did NASA confirm life on Mars recently?",
    "Is the Great Wall of China visible from space?",
    "What are the red flags of a fake news article?",
    "How do I verify if an image has been doctored?",
    "Explain how deepfakes are created and detected",
];
function verdictMeta(verdict) {
    const v = verdict?.toLowerCase() || "";
    if (v === "real")
        return { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", bar: "bg-emerald-500", label: "REAL", emoji: "✅" };
    if (v === "fake")
        return { icon: XOctagon, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800", bar: "bg-red-500", label: "FAKE", emoji: "❌" };
    if (v === "misleading")
        return { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", bar: "bg-amber-500", label: "MISLEADING", emoji: "⚠️" };
    return { icon: HelpCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", bar: "bg-blue-400", label: "UNVERIFIABLE", emoji: "🔍" };
}
function factStatusColor(status) {
    if (status === "verified")
        return "text-emerald-600 dark:text-emerald-400";
    if (status === "false")
        return "text-red-500 dark:text-red-400";
    if (status === "disputed")
        return "text-amber-500 dark:text-amber-400";
    return "text-muted-foreground";
}
function factStatusIcon(status) {
    if (status === "verified")
        return "✅";
    if (status === "false")
        return "❌";
    if (status === "disputed")
        return "⚠️";
    return "❓";
}
// ── Verdict Card ─────────────────────────────────────────────────────────────
function VerdictCard({ data }) {
    const meta = verdictMeta(data.consensus);
    const Icon = meta.icon;
    const [expanded, setExpanded] = useState(false);
    return (<motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="ml-12 mb-2">
      <div className={cn("rounded-2xl border p-4 shadow-md", meta.bg)}>
        {/* Consensus header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", meta.bg, "border", meta.bg)}>
              <Icon className={cn("h-5 w-5", meta.color)}/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-black tracking-tight", meta.color)}>{meta.emoji} {meta.label}</span>
                <span className="text-xs text-muted-foreground font-medium">consensus verdict</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {data.avgConfidence}% average confidence · 3-AI cross-check
              </div>
            </div>
          </div>
          <button onClick={() => setExpanded((e) => !e)} className="text-xs text-muted-foreground hover:text-foreground border border-border/60 px-2.5 py-1 rounded-lg transition-colors bg-background/60">
            {expanded ? "Less" : "Details"}
          </button>
        </div>

        {/* Confidence bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Confidence</span>
            <span className="font-semibold">{data.avgConfidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${data.avgConfidence}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className={cn("h-full rounded-full", meta.bar)}/>
          </div>
        </div>

        {/* Multi-claim breakdown */}
        {data.claimBreakdowns && data.claimBreakdowns.length > 1 && (<div className="mb-3 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              {data.claimBreakdowns.length} Claims Verified Independently
            </p>
            {data.claimBreakdowns.map((cb, i) => {
                const cbMeta = verdictMeta(cb.consensus);
                return (<div key={i} className="flex items-center gap-2 bg-background/60 border border-border/40 rounded-xl px-2.5 py-1.5 text-xs">
                  <span className={cn("font-bold shrink-0", cbMeta.color)}>{cbMeta.emoji}</span>
                  <span className="text-muted-foreground flex-1 truncate">{cb.claim}</span>
                  <span className={cn("font-bold shrink-0", cbMeta.color)}>{cb.consensus}</span>
                  <span className="text-muted-foreground shrink-0">{cb.confidence}%</span>
                </div>);
            })}
          </div>)}

        {/* AI breakdown pills */}
        <div className="flex gap-2 flex-wrap mb-2">
          {data.gpt && (<div className="flex items-center gap-1.5 text-xs bg-background/60 border border-border/60 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"/>
              <span className="font-semibold text-foreground">GPT-5:</span>
              <span className={verdictMeta(data.gpt.verdict).color + " font-bold"}>{data.gpt.verdict}</span>
              <span className="text-muted-foreground">({data.gpt.confidence}%)</span>
            </div>)}
          {data.gemini && (<div className="flex items-center gap-1.5 text-xs bg-background/60 border border-border/60 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"/>
              <span className="font-semibold text-foreground">Gemini:</span>
              <span className={verdictMeta(data.gemini.verdict).color + " font-bold"}>{data.gemini.verdict}</span>
              <span className="text-muted-foreground">({data.gemini.confidence}%)</span>
            </div>)}
          <div className="flex items-center gap-1.5 text-xs bg-background/60 border border-border/60 rounded-full px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0"/>
            <span className="font-semibold text-foreground">Claude:</span>
            <span className="text-muted-foreground">synthesizing below ↓</span>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="border-t border-border/40 pt-3 mt-1 space-y-4">
                {/* GPT detail */}
                {data.gpt && (<div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"/>
                      <span className="text-xs font-bold text-foreground">OpenAI GPT-5 Analysis</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{data.gpt.summary}</p>
                    {data.gpt.factPoints.length > 0 && (<div className="space-y-1">
                        {data.gpt.factPoints.map((fp, i) => (<div key={i} className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 mt-0.5">{factStatusIcon(fp.status)}</span>
                            <span className={cn("leading-relaxed", factStatusColor(fp.status))}>{fp.point}</span>
                          </div>))}
                      </div>)}
                    {data.gpt.redFlags && data.gpt.redFlags.length > 0 && (<div className="mt-2 flex flex-wrap gap-1">
                        {data.gpt.redFlags.map((flag, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                            ⚠ {flag}
                          </span>))}
                      </div>)}
                    {data.gpt.manipulationTactic && (<p className="mt-2 text-[10px] px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                        ⚡ Manipulation tactic: <strong>{data.gpt.manipulationTactic}</strong>
                      </p>)}
                  </div>)}

                {/* Gemini detail */}
                {data.gemini && (<div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"/>
                      <span className="text-xs font-bold text-foreground">Google Gemini Analysis</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{data.gemini.summary}</p>
                    {data.gemini.factPoints.length > 0 && (<div className="space-y-1">
                        {data.gemini.factPoints.map((fp, i) => (<div key={i} className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 mt-0.5">{factStatusIcon(fp.status)}</span>
                            <span className={cn("leading-relaxed", factStatusColor(fp.status))}>{fp.point}</span>
                          </div>))}
                      </div>)}
                    {data.gemini.contextNote && (<p className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-900">
                        📌 {data.gemini.contextNote}
                      </p>)}
                    {data.gemini.logicalIssue && (<p className="mt-2 text-[10px] px-2.5 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
                        🧠 Logical issue: <strong>{data.gemini.logicalIssue}</strong>
                      </p>)}
                  </div>)}
              </div>
            </motion.div>)}
        </AnimatePresence>
      </div>
    </motion.div>);
}
// ── Message formatting ────────────────────────────────────────────────────────
function formatContent(content) {
    return content.split("\n").map((line, i) => {
        const bold = (text) => text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        if (line.trim() === "---")
            return <hr key={i} className="border-border/40 my-2"/>;
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
            return (<div key={i} className="flex items-start gap-2 ml-2">
          <span className="text-primary mt-1 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: bold(line.replace(/^[-•]\s*/, "")) }}/>
        </div>);
        }
        const numMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) {
            return (<div key={i} className="flex items-start gap-2 ml-2">
          <span className="text-primary font-bold shrink-0 min-w-[1.2rem]">{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: bold(numMatch[2]) }}/>
        </div>);
        }
        if (line.startsWith("## "))
            return <h3 key={i} className="font-bold text-base mt-3 mb-1" dangerouslySetInnerHTML={{ __html: line.replace("## ", "") }}/>;
        if (line.startsWith("# "))
            return <h2 key={i} className="font-bold text-lg mt-3 mb-1" dangerouslySetInnerHTML={{ __html: line.replace("# ", "") }}/>;
        if (line.trim() === "")
            return <div key={i} className="h-2"/>;
        return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bold(line) }}/>;
    });
}
// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, onCopy }) {
    const isUser = msg.role === "user";
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        onCopy(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (<div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn("w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-sm", isUser ? "satya-gradient text-white" : "bg-muted border border-border text-primary")}>
        {isUser ? <User className="h-4 w-4"/> : <Bot className="h-4 w-4"/>}
      </div>

      {/* Content column */}
      <div className={cn("max-w-[80%] flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
        {/* Verdict card (assistant only) */}
        {!isUser && msg.verdict && (<div className="w-full">
            <VerdictCard data={msg.verdict}/>
          </div>)}

        {/* Text bubble */}
        {(msg.isAnalyzing || msg.content || msg.isStreaming) && (<div className={cn("relative group w-full")}>
            <div className={cn("rounded-2xl px-5 py-4 shadow-sm text-sm space-y-1", isUser ? "satya-gradient text-white rounded-tr-sm" : "bg-card border border-border/60 text-foreground rounded-tl-sm")}>
              {msg.isAnalyzing ? (<div className="space-y-2">
                  {msg.scrapedArticle && (<div className="flex items-center gap-2 text-xs bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-primary font-medium mb-2">
                      <span>📰</span>
                      <span className="truncate">{msg.scrapedArticle.title || msg.scrapedArticle.domain} · {msg.scrapedArticle.wordCount} words fetched</span>
                    </div>)}
                  <div className="flex items-center gap-2.5 text-muted-foreground py-1">
                    <Search className="h-4 w-4 animate-pulse text-primary shrink-0"/>
                    <span className="text-sm">{msg.analyzingStatus || "Running triple-AI analysis..."}</span>
                    <div className="flex gap-1">
                      {[0, 0.15, 0.3].map((d, i) => (<motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} className="w-1.5 h-1.5 rounded-full bg-primary/60"/>))}
                    </div>
                  </div>
                </div>) : msg.content === "" && msg.isStreaming ? (<div className="flex items-center gap-1.5 py-1">
                  {[0, 0.15, 0.3].map((d, i) => (<motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} className={cn("w-2 h-2 rounded-full", isUser ? "bg-white/70" : "bg-primary/60")}/>))}
                </div>) : (<div className="space-y-1">
                  {formatContent(msg.content)}
                  {msg.isStreaming && (<span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 translate-y-0.5"/>)}
                </div>)}
            </div>

            {/* Copy */}
            {!msg.isStreaming && !msg.isAnalyzing && msg.content && (<button onClick={handleCopy} className={cn("absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground flex items-center gap-1", isUser ? "right-0" : "left-0")}>
                {copied ? <><Check className="h-3 w-3 text-emerald-500"/>Copied</> : <><Copy className="h-3 w-3"/>Copy</>}
              </button>)}
          </div>)}
      </div>
    </div>);
}
// ── Main Chat page ─────────────────────────────────────────────────────────────
export default function Chat() {
    const [messages, setMessages] = useState([{
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm **SatyaCheck AI** — your personal fact-checking assistant powered by three independent AIs. 🔍\n\nAsk me about any news story, viral claim, or headline. I'll give you a clear verdict — **✅ Real**, **❌ Fake**, or **⚠️ Misleading** — backed by OpenAI GPT-5, Google Gemini, and Claude all cross-checking at the same time.\n\nYou can also ask me how to spot fake news, how deepfakes work, or anything about media literacy!",
        }]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const sendMessage = useCallback(async (text) => {
        const content = (text ?? input).trim();
        if (!content || isLoading)
            return;
        const userMsg = { id: Date.now().toString(), role: "user", content };
        const assistantId = (Date.now() + 1).toString();
        const assistantMsg = { id: assistantId, role: "assistant", content: "", isStreaming: true };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        setIsLoading(true);
        try {
            const apiMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages }),
            });
            if (!response.ok || !response.body)
                throw new Error("Connection failed");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (!line.startsWith("data: "))
                        continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === "analyzing") {
                            setMessages((prev) => prev.map((m) => m.id === assistantId
                                ? { ...m, isAnalyzing: true, analyzingStatus: data.message || "Running triple-AI analysis..." }
                                : m));
                        }
                        if (data.type === "scraped") {
                            setMessages((prev) => prev.map((m) => m.id === assistantId
                                ? { ...m, isAnalyzing: true, scrapedArticle: data.article, analyzingStatus: `Fetched "${data.article?.title || data.article?.domain}" — analyzing content...` }
                                : m));
                        }
                        if (data.type === "verdict") {
                            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isAnalyzing: false, verdict: data.verdict } : m));
                        }
                        if (data.type === "content") {
                            fullText += data.content;
                            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isAnalyzing: false, content: fullText } : m));
                        }
                        if (data.type === "done") {
                            setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m));
                        }
                        if (data.type === "error")
                            throw new Error(data.error);
                    }
                    catch {
                        // Skip malformed SSE lines
                    }
                }
            }
        }
        catch {
            setMessages((prev) => prev.map((m) => m.id === assistantId
                ? { ...m, content: "Sorry, I couldn't connect to the AI right now. Please try again.", isStreaming: false, isAnalyzing: false }
                : m));
        }
        finally {
            setIsLoading(false);
        }
    }, [input, messages, isLoading]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const clearChat = () => {
        setMessages([{
                id: "welcome-2",
                role: "assistant",
                content: "Chat cleared! Ask me about any news story, claim, or headline and I'll fact-check it instantly. 🔍",
            }]);
    };
    const copyText = async (text) => {
        await navigator.clipboard.writeText(text).catch(() => { });
    };
    const { isListening, isSupported: voiceSupported, start: startListening, stop: stopListening } = useVoiceInput((transcript) => {
        setInput((prev) => prev ? prev + " " + transcript : transcript);
        textareaRef.current?.focus();
    });
    return (<div className="container mx-auto max-w-4xl px-4 flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary"/>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">AI Chat</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Ask SatyaCheck AI</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Triple-AI cross-verification: Claude + GPT-5 + Gemini working together
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            3 AIs active
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat" className="rounded-xl">
            <RefreshCw className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (<motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <MessageBubble msg={msg} onCopy={copyText}/>
            </motion.div>))}
        </AnimatePresence>

        {/* Quick prompts */}
        {messages.length === 1 && (<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 ml-12">
              Try asking...
            </p>
            <div className="ml-12 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (<button key={prompt} onClick={() => sendMessage(prompt)} className="text-xs text-left px-3 py-2 rounded-xl bg-muted/50 border border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all duration-200 text-muted-foreground">
                  {prompt}
                </button>))}
            </div>
          </motion.div>)}

        <div ref={bottomRef}/>
      </div>

      {/* AI Power Badges */}
      <div className="flex items-center gap-2 pb-3 shrink-0 flex-wrap">
        {[
            { label: "Claude AI", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900" },
            { label: "OpenAI GPT-5", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" },
            { label: "Google Gemini", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" },
        ].map((ai) => (<span key={ai.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ai.bg} ${ai.color}`}>
            {ai.label}
          </span>))}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500"/>
          cross-verifying every claim in real-time
        </span>
      </div>

      {/* Input area */}
      <Card className="border-border/70 shadow-lg shrink-0">
        <CardContent className="p-3">
          {isListening && (<div className="mb-2 flex items-center gap-2 text-xs text-destructive font-medium px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"/>
              Listening... Speak your question now
            </div>)}
          <div className="flex items-end gap-3">
            <Textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about any news claim, headline, or story... (Enter to send, Shift+Enter for new line)" className="resize-none border-0 shadow-none focus-visible:ring-0 text-sm min-h-[60px] max-h-[160px] bg-transparent" rows={2}/>
            <div className="flex items-center gap-2 shrink-0 pb-1">
              {voiceSupported && (<Button variant={isListening ? "destructive" : "ghost"} size="icon" onClick={isListening ? stopListening : startListening} className={cn("rounded-xl h-10 w-10 shrink-0", isListening && "animate-pulse")}>
                  {isListening ? <MicOff className="h-4 w-4"/> : <Mic className="h-4 w-4"/>}
                </Button>)}
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} className="rounded-xl h-10 w-10 p-0 satya-gradient border-0 shadow-md hover:shadow-lg transition-shadow shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground/50 mt-2 pb-2 shrink-0">
        SatyaCheck AI can make mistakes. Always verify critical information from authoritative sources.
      </p>
    </div>);
}
