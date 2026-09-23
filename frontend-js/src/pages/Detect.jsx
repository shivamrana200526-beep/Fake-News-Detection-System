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
import {
  FileText, Globe, Image as ImageIcon, Link2, Loader2, AlertTriangle,
  ShieldCheck, XOctagon, Info, ExternalLink, Mic, MicOff, Clipboard,
  Share2, Copy, Check, Download, Keyboard, Zap, BookOpen, User, Calendar,
  Eye, TrendingUp, TriangleAlert, CheckCircle2, Shield
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const COLORS = ["#15803D", "#DC2626", "#D97706"];

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#15803D", "#2E7D52", "#4ADE80"],
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
    if (!content.trim()) return;
    mutate({ data: { content, type: activeTab } });
  }, [content, activeTab, mutate]);

  // Confetti on real news + save to history
  useEffect(() => {
    if (result) {
      if (result.prediction?.toLowerCase() === "real") fireConfetti();
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
  const { isListening, isSupported: voiceSupported, start: startListening, stop: stopListening } =
    useVoiceInput((transcript) => setContent((prev) => (prev ? prev + " " + transcript : transcript)));

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
    } catch {
      // clipboard read failed silently
    }
  };

  // Copy result to clipboard
  const handleCopyResult = async () => {
    if (!result) return;
    const text = `SatyaCheck Verification Finding:\nVerdict: ${result.prediction?.toUpperCase()} (${result.confidence}% confidence)\nExplanation: ${result.explanation}\nVerified via SatyaCheck`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share result via Web Share API
  const handleShare = async () => {
    if (!result) return;
    const text = `SatyaCheck Finding: ${result.prediction?.toUpperCase()} (${result.confidence}% confidence)\n\n"${result.explanation?.substring(0, 120)}..."`;
    if (navigator.share) {
      await navigator.share({ title: "SatyaCheck Finding", text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const renderVerdictBadge = (prediction = "") => {
    switch (prediction.toLowerCase()) {
      case "real":
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            VERIFIED REAL
          </div>
        );
      case "fake":
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 font-semibold text-sm">
            <XOctagon className="h-4 w-4 text-red-600 dark:text-red-400" />
            IDENTIFIED FAKE
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            MISLEADING CONTEXT
          </div>
        );
    }
  };

  const getChartData = () => {
    if (!result) return [];
    if (result.prediction?.toLowerCase() === "real") {
      return [{ name: "Real", value: result.confidence }, { name: "Other", value: 100 - result.confidence }];
    } else if (result.prediction?.toLowerCase() === "fake") {
      return [{ name: "Real", value: 100 - result.confidence }, { name: "Fake", value: result.confidence }];
    } else {
      return [
        { name: "Real", value: 50 - result.confidence / 4 },
        { name: "Fake", value: 50 - result.confidence / 4 },
        { name: "Misleading", value: result.confidence },
      ];
    }
  };

  const verdictBorderColor =
    result?.prediction?.toLowerCase() === "real"
      ? "#15803D"
      : result?.prediction?.toLowerCase() === "fake"
      ? "#DC2626"
      : "#D97706";

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Forensic Workspace</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Content & Claim Inspection</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Submit news articles, online claims, URLs, or screenshots for structured forensic evaluation across 10 dimensions.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 rounded-md border border-border text-xs text-muted-foreground">
          <Keyboard className="h-3.5 w-3.5" />
          <span>Press <kbd className="px-1 py-0.5 bg-card rounded border font-mono">⌘</kbd> + <kbd className="px-1 py-0.5 bg-card rounded border font-mono">↵</kbd> to analyze</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Console */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-5">
              <CardTitle className="text-sm font-semibold">Input Content</CardTitle>
              <CardDescription className="text-xs">Select submission format and enter content</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setContent(""); }} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="text" className="text-xs"><FileText className="h-3.5 w-3.5 mr-1 hidden sm:block" />Text</TabsTrigger>
                  <TabsTrigger value="url" className="text-xs"><Link2 className="h-3.5 w-3.5 mr-1 hidden sm:block" />URL</TabsTrigger>
                  <TabsTrigger value="headline" className="text-xs"><Globe className="h-3.5 w-3.5 mr-1 hidden sm:block" />Headline</TabsTrigger>
                  <TabsTrigger value="image" className="text-xs"><ImageIcon className="h-3.5 w-3.5 mr-1 hidden sm:block" />Image</TabsTrigger>
                </TabsList>

                <div className="min-h-[190px]">
                  <TabsContent value="text" className="mt-0">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Paste the full article text, social media copy, or viral quote..."
                      className="min-h-[190px] resize-y text-sm p-3.5 border-border rounded-md"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-0">
                    <Input
                      placeholder="https://news-outlet.com/article-headline"
                      className="h-11 text-sm border-border rounded-md"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="headline" className="mt-0">
                    <Textarea
                      placeholder="Enter the headline or breaking news claim..."
                      className="min-h-[130px] resize-y text-sm p-3.5 border-border rounded-md"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="image" className="mt-0">
                    <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:bg-muted/40 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {content ? (
                        <div className="relative">
                          <img src={content} alt="Preview" className="max-h-[180px] mx-auto rounded border" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <span className="text-white font-medium text-xs">Click to replace file</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                          <div className="p-3 bg-muted rounded-full">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-xs text-foreground">Click or drop screenshot here</span>
                          <span className="text-[11px] text-muted-foreground">JPEG, PNG, WEBP screenshots</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Quick Actions */}
              {activeTab !== "image" && (
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClipboardPaste} className="flex-1 gap-1.5 text-xs h-8">
                    <Clipboard className="h-3 w-3" />
                    Paste Clipboard
                  </Button>
                  {voiceSupported && (
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      className={cn("gap-1.5 text-xs h-8", isListening && "animate-pulse")}
                    >
                      {isListening ? (<><MicOff className="h-3 w-3" />Stop</>) : (<><Mic className="h-3 w-3" />Dictate</>)}
                    </Button>
                  )}
                </div>
              )}

              {isListening && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive font-medium px-3 py-1.5 bg-destructive/10 rounded border border-destructive/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  Recording dictation...
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  className="w-full h-10 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  onClick={handleAnalyze}
                  disabled={isPending || !content}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cross-Checking Forensic Claims...
                    </>
                  ) : (
                    "Run Forensic Verification"
                  )}
                </Button>
                {error && (
                  <p className="text-destructive text-xs mt-2.5 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {error.message || "Verification request failed. Please try again."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Protocol Notice */}
          <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" /> Verification Protocol
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-[11px] leading-relaxed">
              <li>Full article text yields the highest forensic confidence.</li>
              <li>Scrapes live content when given a direct URL to verify claims against the published context.</li>
              <li>Examines emotional tactics, headline consistency, and logical fallacies.</li>
            </ul>
          </div>
        </div>

        {/* Right: Results View */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !isPending && (
              <div className="h-full min-h-[440px] flex flex-col items-center justify-center border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground bg-muted/10">
                <img src="/logo-mark.png" alt="SatyaCheck" className="h-12 w-auto object-contain opacity-50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">Awaiting Content for Inspection</h3>
                <p className="max-w-sm text-xs leading-relaxed">
                  Submit text, a news URL, a headline, or an image on the left to generate an auditable forensic verdict.
                </p>
              </div>
            )}

            {isPending && (
              <div className="h-full min-h-[440px] flex flex-col items-center justify-center border border-border rounded-lg p-8 text-center bg-card shadow-xs">
                <div className="relative mb-5">
                  <img src="/logo-mark.png" alt="SatyaCheck" className="h-12 w-12 object-contain animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Corroborating Evidence...</h3>
                <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
                  Evaluating claim structure across 10 forensic dimensions, cross-checking primary sources, and diagnosing manipulation signals.
                </p>
              </div>
            )}

            {result && !isPending && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                
                {/* Scraped article context header */}
                {result.scrapedArticle && (
                  <div className="p-3.5 rounded-lg border border-border bg-muted/40 text-xs flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{result.scrapedArticle.title || "Scraped URL Article"}</p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-0.5">
                        {result.scrapedArticle.domain && <span>Domain: {result.scrapedArticle.domain}</span>}
                        {result.scrapedArticle.author && <span>By {result.scrapedArticle.author}</span>}
                        {result.scrapedArticle.wordCount > 0 && <span>{result.scrapedArticle.wordCount} words inspected</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Verdict Banner */}
                <Card className="border border-border shadow-xs overflow-hidden">
                  <div className="p-5 md:p-6 border-b border-border bg-card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                          Forensic Verdict
                        </span>
                        <div className="flex items-center gap-3">
                          {renderVerdictBadge(result.prediction)}
                          <span className="text-2xl font-bold font-mono text-foreground">
                            {result.confidence}%
                            <span className="text-xs text-muted-foreground font-sans font-normal ml-1.5">confidence</span>
                          </span>
                        </div>
                      </div>

                      <div className="h-[75px] w-[100px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={getChartData()} innerRadius={22} outerRadius={34} paddingAngle={2} dataKey="value">
                              {getChartData().map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: "6px", fontSize: "11px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-md p-3.5 border border-border/70">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Executive Summary</p>
                      <p className="text-sm text-foreground/90 leading-relaxed font-sans">{result.explanation}</p>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Manipulation Score Meter */}
                    {result.manipulationScore !== undefined && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                            Manipulation Diagnostic
                          </span>
                          <span className={cn(
                            "font-bold font-mono",
                            result.manipulationScore >= 60 ? "text-red-600" :
                            result.manipulationScore >= 35 ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {result.manipulationScore}/100
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            style={{ width: `${result.manipulationScore}%` }}
                            className={cn(
                              "h-full rounded-full transition-all",
                              result.manipulationScore >= 60 ? "bg-red-600" :
                              result.manipulationScore >= 35 ? "bg-amber-500" : "bg-emerald-600"
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Emotional Tactics & Fallacies */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {result.emotionalTactics?.length > 0 && (
                        <div className="p-3 rounded-md bg-muted/30 border border-border/60">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Rhetorical Tactics
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {result.emotionalTactics.map((tactic, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                                {tactic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.logicalFallacies?.length > 0 && (
                        <div className="p-3 rounded-md bg-muted/30 border border-border/60">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Logical Fallacies
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {result.logicalFallacies.map((fallacy, i) => (
                              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                                {fallacy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Missing Context */}
                    {result.missingContext && (
                      <div className="p-3 rounded-md bg-muted/40 border border-border text-xs leading-relaxed">
                        <span className="font-semibold text-foreground block mb-0.5">Critical Context Omitted:</span>
                        <span className="text-muted-foreground">{result.missingContext}</span>
                      </div>
                    )}

                    {/* Share / Export */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" onClick={handleCopyResult} className="text-xs h-8 gap-1.5">
                        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied" : "Copy Finding"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShare} className="text-xs h-8 gap-1.5">
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Fact by fact breakdown */}
                {result.factBreakdown && result.factBreakdown.length > 0 && (
                  <Card className="border-border shadow-xs">
                    <CardHeader className="py-3 px-5 border-b border-border bg-muted/30">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Forensic Itemization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {result.factBreakdown.map((fb, i) => (
                        <div key={i} className="p-3 rounded border border-border/70 bg-card flex items-start gap-3 text-xs">
                          {fb.status === "real" ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : fb.status === "fake" ? (
                            <XOctagon className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold block">
                              {fb.category}
                            </span>
                            <p className="text-foreground leading-relaxed mt-0.5">{fb.detail}</p>
                          </div>
                          <span className={cn(
                            "text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium",
                            fb.status === "real" ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" :
                            fb.status === "fake" ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300" :
                            "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                          )}>
                            {fb.status}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Corroborating verification findings */}
                {result.geminiVerification && (
                  <Card className="border-border shadow-xs">
                    <CardHeader className="py-3 px-5 border-b border-border bg-muted/30">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Corroborating Evidence & Cross-Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-border/60">
                        <span>Cross-examination verdict: <strong>{result.geminiVerification.verdict}</strong></span>
                        <span className="font-mono text-muted-foreground">{result.geminiVerification.confidence}% confidence</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-1">{result.geminiVerification.reasoning}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Reset button */}
                <Button
                  variant="outline"
                  className="w-full h-9 text-xs rounded-md"
                  onClick={() => {
                    setContent("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Verify Another Claim
                </Button>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
