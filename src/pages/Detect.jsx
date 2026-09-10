import { useState, useCallback, useEffect, useRef } from "react";
import { useAnalyzeContent } from "@/hooks/use-analysis";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { saveToHistory } from "@/pages/History";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Globe, Image as ImageIcon, Link2, Loader2, AlertTriangle, ShieldCheck, XOctagon, Info, ExternalLink, Mic, MicOff, Clipboard, Share2, Copy, Check, Keyboard, Zap, BookOpen, User, Calendar, Eye, TrendingUp, TriangleAlert } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];
function fireConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#4ade80', '#a3e635'],
    });
}
export default function Detect() {
    const [activeTab, setActiveTab] = useState("text");
    const [content, setContent] = useState("");
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const textareaRef = useRef(null);
    const { mutate, isPending, data: result, error } = useAnalyzeContent();
    const handleAnalyze = useCallback(() => {
        if (!content.trim())
            return;
        mutate({ data: { content, type: activeTab } });
    }, [content, activeTab, mutate]);
    // Confetti on real news + save to history
    useEffect(() => {
        if (result) {
            if (result.prediction.toLowerCase() === "real")
                fireConfetti();
            saveToHistory({
                content: content.substring(0, 300),
                type: activeTab,
                verdict: result.prediction,
                confidence: result.confidence,
                explanation: result.explanation?.substring(0, 150),
            });
        }
    }, [result]);
    // Keyboard shortcut: Ctrl/Cmd + Enter to analyze
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleAnalyze();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [handleAnalyze]);
    // Voice input
    const { isListening, isSupported: voiceSupported, start: startListening, stop: stopListening } = useVoiceInput((transcript) => setContent((prev) => prev ? prev + " " + transcript : transcript));
    // Image upload
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setContent(reader.result);
            reader.readAsDataURL(file);
        }
    };
    // Paste from clipboard
    const handleClipboardPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setContent(text);
                setActiveTab("text");
                textareaRef.current?.focus();
            }
        }
        catch {
            // clipboard read failed silently
        }
    };
    // Copy result to clipboard
    const handleCopyResult = async () => {
        if (!result)
            return;
        const text = `SatyaCheck Verdict: ${result.prediction.toUpperCase()} (${result.confidence}% confidence)\n\n${result.explanation}\n\nVerified at satya.check`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    // Share result via Web Share API
    const handleShare = async () => {
        if (!result)
            return;
        const text = `🔍 SatyaCheck Verdict: ${result.prediction.toUpperCase()} (${result.confidence}% confidence)\n\n"${result.explanation.substring(0, 120)}..."\n\nCheck news with AI at SatyaCheck!`;
        if (navigator.share) {
            await navigator.share({ title: "SatyaCheck Verdict", text });
        }
        else {
            await navigator.clipboard.writeText(text);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }
    };
    const renderVerdictBadge = (prediction) => {
        switch (prediction.toLowerCase()) {
            case "real":
                return (<Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-base py-1.5 px-5 hover:bg-emerald-100">
            <ShieldCheck className="mr-2 h-5 w-5"/> REAL
          </Badge>);
            case "fake":
                return (<Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-300 dark:border-red-800 text-base py-1.5 px-5 hover:bg-red-100">
            <XOctagon className="mr-2 h-5 w-5"/> FAKE
          </Badge>);
            default:
                return (<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-base py-1.5 px-5 hover:bg-amber-100">
            <AlertTriangle className="mr-2 h-5 w-5"/> MISLEADING
          </Badge>);
        }
    };
    const getChartData = () => {
        if (!result)
            return [];
        if (result.prediction.toLowerCase() === "real") {
            return [{ name: "Real", value: result.confidence }, { name: "Other", value: 100 - result.confidence }];
        }
        else if (result.prediction.toLowerCase() === "fake") {
            return [{ name: "Real", value: 100 - result.confidence }, { name: "Fake", value: result.confidence }];
        }
        else {
            return [
                { name: "Real", value: 50 - result.confidence / 4 },
                { name: "Fake", value: 50 - result.confidence / 4 },
                { name: "Misleading", value: result.confidence },
            ];
        }
    };
    const verdictBorderColor = result?.prediction.toLowerCase() === "real"
        ? "#22c55e"
        : result?.prediction.toLowerCase() === "fake"
            ? "#ef4444"
            : "#f59e0b";
    return (<div className="container mx-auto max-w-6xl px-4 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Content Analysis</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Submit news articles, headlines, URLs, or images for forensic AI evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground">
          <Keyboard className="h-3.5 w-3.5"/>
          <span>Press <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono text-foreground">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono text-foreground">↵</kbd> to analyze</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-lg border-border/60">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Submit Content</CardTitle>
              <CardDescription>Choose the type and paste or speak your content.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setContent(""); }} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="text"><FileText className="h-4 w-4 mr-1.5 hidden sm:block"/>Text</TabsTrigger>
                  <TabsTrigger value="url"><Link2 className="h-4 w-4 mr-1.5 hidden sm:block"/>URL</TabsTrigger>
                  <TabsTrigger value="headline"><Brain className="h-4 w-4 mr-1.5 hidden sm:block"/>Headline</TabsTrigger>
                  <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-1.5 hidden sm:block"/>Image</TabsTrigger>
                </TabsList>

                <div className="min-h-[200px]">
                  <TabsContent value="text" className="mt-0">
                    <Textarea ref={textareaRef} placeholder="Paste the full article text here..." className="min-h-[200px] resize-y text-base p-4" value={content} onChange={(e) => setContent(e.target.value)}/>
                  </TabsContent>
                  <TabsContent value="url" className="mt-0">
                    <Input placeholder="https://example.com/news-article" className="h-14 text-base" value={content} onChange={(e) => setContent(e.target.value)}/>
                  </TabsContent>
                  <TabsContent value="headline" className="mt-0">
                    <Textarea placeholder="Enter the news headline or claim..." className="min-h-[140px] resize-y text-base p-4" value={content} onChange={(e) => setContent(e.target.value)}/>
                  </TabsContent>
                  <TabsContent value="image" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer relative group">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                      {content ? (<div className="relative">
                          <img src={content} alt="Preview" className="max-h-[200px] mx-auto rounded-lg shadow-md"/>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">Click to replace</span>
                          </div>
                        </div>) : (<div className="flex flex-col items-center gap-3 text-muted-foreground py-6">
                          <div className="p-4 bg-muted rounded-full">
                            <ImageIcon className="h-8 w-8"/>
                          </div>
                          <span className="font-medium text-sm">Click or drag image here</span>
                          <span className="text-xs">Supports JPG, PNG, WEBP</span>
                        </div>)}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Quick Actions */}
              {activeTab !== "image" && (<div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClipboardPaste} className="flex-1 gap-2 text-xs rounded-lg">
                    <Clipboard className="h-3.5 w-3.5"/>
                    Paste from Clipboard
                  </Button>
                  {voiceSupported && (<Button variant={isListening ? "destructive" : "outline"} size="sm" onClick={isListening ? stopListening : startListening} className={cn("gap-2 text-xs rounded-lg", isListening && "animate-pulse")}>
                      {isListening ? (<><MicOff className="h-3.5 w-3.5"/>Stop</>) : (<><Mic className="h-3.5 w-3.5"/>Speak</>)}
                    </Button>)}
                </div>)}

              {isListening && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 flex items-center gap-2 text-sm text-destructive font-medium px-3 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"/>
                  Listening... Speak your claim now
                </motion.div>)}

              <div className="mt-5 pt-5 border-t border-border">
                <Button className="w-full h-13 text-base rounded-xl shadow-md hover:shadow-lg transition-all satya-gradient border-0" onClick={handleAnalyze} disabled={isPending || !content}>
                  {isPending ? (<>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                      Analyzing with AI...
                    </>) : ("Verify Authenticity")}
                </Button>
                {error && (<p className="text-destructive text-sm mt-3 flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4"/>
                    {error.message || "Failed to analyze. Please try again."}
                  </p>)}
              </div>
            </CardContent>
          </Card>

          {/* Tips card */}
          <Card className="border-border/40 bg-muted/20">
            <CardContent className="p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary"/> Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> For best results, paste the full article text</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use the <strong>Speak</strong> button to dictate a claim hands-free</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Press <kbd className="px-1 py-0.5 bg-card rounded border text-foreground font-mono">⌘+↵</kbd> anywhere to analyze instantly</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Two AIs (OpenAI + Gemini) independently verify every claim</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !isPending && (<motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[480px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground bg-muted/10">
                <div className="p-6 bg-muted rounded-2xl mb-5">
                  <ShieldCheck className="h-12 w-12 text-primary/30"/>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Awaiting Content</h3>
                <p className="max-w-md text-sm leading-relaxed">
                  Submit content on the left and our dual AI engines will provide a verdict — Real, Fake, or Misleading — with detailed reasoning.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs bg-background rounded-lg px-4 py-2 border border-border">
                  <Mic className="h-3.5 w-3.5 text-primary"/>
                  <span>Try the <strong>Speak</strong> button for hands-free voice analysis</span>
                </div>
              </motion.div>)}

            {isPending && (<motion.div key="loading" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="h-full min-h-[480px] flex flex-col items-center justify-center border border-border rounded-2xl p-12 text-center bg-card shadow-lg">
                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                  <div className="absolute inset-0 rounded-full satya-gradient opacity-10 animate-ping"/>
                  <div className="absolute inset-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin"/>
                  <div className="absolute inset-4 rounded-full border-2 border-violet-400/20 border-r-violet-400 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }}/>
                  <Brain className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-2xl font-bold mb-2">Cross-referencing Data...</h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Consulting OpenAI & Gemini simultaneously, verifying facts, and assessing source credibility.
                </p>
                <div className="mt-8 flex gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                    OpenAI active
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.3s" }}/>
                    Gemini active
                  </div>
                </div>
              </motion.div>)}

            {result && !isPending && (<motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Scraped article preview — URL type only */}
                {result.scrapedArticle && (<Card className="border-primary/20 bg-primary/5 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg satya-gradient flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-white"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Article fetched & analyzed</p>
                          {result.scrapedArticle.title && (<p className="font-semibold text-foreground text-sm leading-snug mb-1 truncate">{result.scrapedArticle.title}</p>)}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {result.scrapedArticle.author && (<span className="flex items-center gap-1"><User className="h-3 w-3"/>{result.scrapedArticle.author}</span>)}
                            {result.scrapedArticle.publishDate && (<span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{new Date(result.scrapedArticle.publishDate).toLocaleDateString()}</span>)}
                            {result.scrapedArticle.wordCount > 0 && (<span className="flex items-center gap-1"><Eye className="h-3 w-3"/>{result.scrapedArticle.wordCount} words read</span>)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Main Verdict */}
                <Card className="border-t-4 shadow-xl overflow-hidden" style={{ borderTopColor: verdictBorderColor }}>
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Final Verdict</span>
                        <div className="flex items-center gap-4 flex-wrap">
                          {renderVerdictBadge(result.prediction)}
                          <span className="text-3xl font-bold">
                            {result.confidence}%
                            <span className="text-base text-muted-foreground font-normal ml-2">confidence</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-[100px] w-[120px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={getChartData()} innerRadius={30} outerRadius={44} paddingAngle={2} dataKey="value">
                              {getChartData().map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent"/>))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px rgb(0 0 0 / 0.15)", fontSize: "12px" }}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-4 border border-border/50 mb-5">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary text-sm">
                        <Brain className="h-4 w-4"/> AI Assessment
                      </h4>
                      <p className="text-foreground/80 leading-relaxed text-sm">"{result.explanation}"</p>
                    </div>

                    {/* Manipulation Score */}
                    {result.manipulationScore !== undefined && (<div className="mb-5 p-4 rounded-xl border border-border/50 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5"/> Manipulation Score
                          </h4>
                          <span className={cn("text-sm font-black", result.manipulationScore >= 60 ? "text-red-600 dark:text-red-400" :
                    result.manipulationScore >= 35 ? "text-amber-600 dark:text-amber-400" :
                        "text-emerald-600 dark:text-emerald-400")}>
                            {result.manipulationScore}/100
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.manipulationScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", result.manipulationScore >= 60 ? "bg-red-500" :
                    result.manipulationScore >= 35 ? "bg-amber-500" :
                        "bg-emerald-500")}/>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {result.manipulationScore >= 60 ? "⚠️ Heavy emotional manipulation detected" :
                    result.manipulationScore >= 35 ? "🔶 Moderate manipulation tactics present" :
                        "✅ Low manipulation — content appears balanced"}
                        </p>
                      </div>)}

                    {/* Emotional Tactics */}
                    {result.emotionalTactics?.length > 0 && (<div className="mb-5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                          <TriangleAlert className="h-3.5 w-3.5"/> Manipulation Tactics Detected
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.emotionalTactics.map((tactic, i) => (<span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-medium">
                              ⚠ {tactic}
                            </span>))}
                        </div>
                      </div>)}

                    {/* Logical Fallacies */}
                    {result.logicalFallacies?.length > 0 && (<div className="mb-5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                          🧠 Logical Fallacies Detected
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.logicalFallacies.map((fallacy, i) => (<span key={i} className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900 font-medium">
                              {fallacy}
                            </span>))}
                        </div>
                      </div>)}

                    {/* Missing Context */}
                    {result.missingContext && (<div className="mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">📌 Missing Context</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">{result.missingContext}</p>
                      </div>)}

                    {result.keywords && result.keywords.length > 0 && (<div className="mb-5">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Detected Entities & Themes</span>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (<Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>))}
                        </div>
                      </div>)}

                    {/* Share Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                      <Button variant="outline" size="sm" onClick={handleCopyResult} className="gap-2 text-xs rounded-lg">
                        {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500"/>Copied!</> : <><Copy className="h-3.5 w-3.5"/>Copy Result</>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs rounded-lg">
                        {shared ? <><Check className="h-3.5 w-3.5 text-emerald-500"/>Copied to share!</> : <><Share2 className="h-3.5 w-3.5"/>Share</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Fact Breakdown */}
                {result.factBreakdown && result.factBreakdown.length > 0 && (<Card className="shadow-md">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary"/> Fact-by-Fact Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {result.factBreakdown.map((fb, i) => (<div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                          {fb.status === "real" ? (<ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"/>) : fb.status === "fake" ? (<XOctagon className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>) : fb.status === "misleading" ? (<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"/>) : (<Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0"/>)}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-muted-foreground uppercase">{fb.category}</span>
                            <p className="text-sm text-foreground leading-relaxed mt-0.5">{fb.detail}</p>
                          </div>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border shrink-0 font-medium", fb.status === "real" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" :
                        fb.status === "fake" ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900" :
                            fb.status === "misleading" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900" :
                                "bg-muted text-muted-foreground border-border")}>
                            {fb.status}
                          </span>
                        </div>))}
                    </CardContent>
                  </Card>)}

                {/* Gemini Verification */}
                {result.geminiVerification && (<Card className="shadow-md border-blue-200/70 dark:border-blue-900/70 bg-blue-50/20 dark:bg-blue-950/10">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Info className="h-4 w-4"/> Google Gemini Independent Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border/50">
                        <span className="text-sm font-medium">
                          Gemini Verdict: <strong className="text-foreground">{result.geminiVerification.verdict}</strong>
                        </span>
                        <Badge variant="outline" className="text-xs">{result.geminiVerification.confidence}% confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.geminiVerification.reasoning}</p>
                      {result.geminiVerification.factPoints && result.geminiVerification.factPoints.length > 0 && (<ul className="space-y-2">
                          {result.geminiVerification.factPoints.map((fp, i) => (<li key={i} className="flex items-start gap-2 text-sm bg-background p-3 rounded-lg border border-border/40">
                              {fp.status === "verified" ? (<ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"/>) : fp.status === "false" ? (<XOctagon className="h-4 w-4 text-destructive mt-0.5 shrink-0"/>) : (<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"/>)}
                              <span className="leading-relaxed">{fp.point}</span>
                            </li>))}
                        </ul>)}
                    </CardContent>
                  </Card>)}

                {/* Source & Author + SDG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="shadow-sm border-border/50">
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5"/> Source
                      </h4>
                      {result.detectedSource && result.detectedSource.name ? (<a href={result.detectedSource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary font-medium hover:underline p-2 rounded-lg hover:bg-muted transition-colors text-sm">
                          {result.detectedSource.name}
                          <ExternalLink className="h-3.5 w-3.5"/>
                        </a>) : (<span className="text-sm text-muted-foreground">Source unknown.</span>)}
                      {result.authorCredibility && (<p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/40 leading-relaxed">
                          {result.authorCredibility}
                        </p>)}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-border/50">
                    <CardContent className="p-5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">SDG Alignment</h4>
                      <div className="flex gap-2 flex-wrap">
                        {["04", "09", "10", "16"].map((num) => (<img key={num} src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${num}.jpg`} alt={`SDG ${num}`} className="h-10 w-10 rounded-lg shadow-sm hover:scale-110 transition-transform cursor-help"/>))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Try another */}
                <Button variant="outline" className="w-full rounded-xl border-dashed" onClick={() => { setContent(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Analyze Another Piece of Content
                </Button>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </div>
    </div>);
}
