import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Brain, ShieldCheck, AlertTriangle, XOctagon, ChevronRight, Star, Trophy, RefreshCw, HelpCircle, } from "lucide-react";
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");
const VERDICT_OPTIONS = [
    {
        label: "Real",
        value: "Real",
        icon: ShieldCheck,
        style: "border-border bg-card hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-foreground",
        active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-md",
    },
    {
        label: "Fake",
        value: "Fake",
        icon: XOctagon,
        style: "border-border bg-card hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 text-foreground",
        active: "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 shadow-md",
    },
    {
        label: "Misleading",
        value: "Misleading",
        icon: AlertTriangle,
        style: "border-border bg-card hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-foreground",
        active: "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 shadow-md",
    },
];
function difficultyColor(d) {
    if (d === "Easy")
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200";
    if (d === "Hard")
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200";
    return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200";
}
function resultStyle(correct) {
    return correct
        ? { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800", label: "✅ Correct!" }
        : { text: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800", label: "❌ Incorrect" };
}
function ScoreScreen({ score, total, totalPoints, maxPoints, onRetry }) {
    const pct = Math.round((totalPoints / maxPoints) * 100);
    const grade = pct >= 90 ? "🏆 Expert" : pct >= 70 ? "🥇 Great" : pct >= 50 ? "🥈 Good" : "🥉 Keep Practicing";
    return (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <div className="w-24 h-24 rounded-3xl satya-gradient flex items-center justify-center mx-auto mb-6 shadow-xl">
        <Trophy className="h-12 w-12 text-white"/>
      </div>
      <h2 className="text-3xl font-black text-foreground mb-1">{grade}</h2>
      <p className="text-muted-foreground mb-6">You completed today's quiz!</p>

      <div className="flex justify-center gap-8 mb-8">
        <div>
          <p className="text-4xl font-black satya-text-gradient">{score}/{total}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="w-px bg-border"/>
        <div>
          <p className="text-4xl font-black satya-text-gradient">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
        <div className="w-px bg-border"/>
        <div>
          <p className="text-4xl font-black satya-text-gradient">{pct}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </div>

      <div className="max-w-xs mx-auto mb-8">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full rounded-full satya-gradient"/>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{totalPoints} / {maxPoints} points</p>
      </div>

      <Button onClick={onRetry} className="satya-gradient border-0 rounded-full px-8 gap-2">
        <RefreshCw className="h-4 w-4"/> Play Again
      </Button>
    </motion.div>);
}
export default function Quiz() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [done, setDone] = useState(false);
    const load = async () => {
        setLoading(true);
        setError("");
        setCurrent(0);
        setSelected(null);
        setConfirmed(false);
        setAnswers([]);
        setShowHint(false);
        setDone(false);
        try {
            const res = await fetch(`${BASE_URL}/api/quiz`);
            if (!res.ok)
                throw new Error("Failed");
            const data = await res.json();
            setQuestions(data.questions || []);
        }
        catch {
            setError("Couldn't load today's quiz. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const q = questions[current];
    const totalScore = answers.filter((a) => a.correct).length;
    const totalPoints = answers.reduce((s, a) => s + (a.correct ? a.points : 0), 0);
    const maxPoints = questions.reduce((s, q) => s + q.points, 0);
    const confirm = () => {
        if (!selected || confirmed)
            return;
        const correct = selected === q.verdict;
        setAnswers((prev) => [...prev, { correct, points: correct ? q.points : 0 }]);
        setConfirmed(true);
    };
    const next = () => {
        if (current >= questions.length - 1) {
            setDone(true);
        }
        else {
            setCurrent((c) => c + 1);
            setSelected(null);
            setConfirmed(false);
            setShowHint(false);
        }
    };
    if (loading) {
        return (<div className="flex flex-col items-center gap-4 py-32">
        <div className="w-16 h-16 rounded-2xl satya-gradient flex items-center justify-center animate-pulse">
          <Brain className="h-8 w-8 text-white"/>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Generating today's quiz...</p>
          <p className="text-sm text-muted-foreground">AI creating 10 unique challenges</p>
        </div>
      </div>);
    }
    return (<div className="container mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary"/>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Daily Quiz</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Real or Fake?</h1>
        <p className="text-muted-foreground">Test your fake news detection skills. 10 headlines — how many can you spot?</p>
      </div>

      {error && (<div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={load} variant="outline">Try Again</Button>
        </div>)}

      {!loading && !error && done && (<Card className="border-border/60 shadow-xl">
          <CardContent className="p-8">
            <ScoreScreen score={totalScore} total={questions.length} totalPoints={totalPoints} maxPoints={maxPoints} onRetry={load}/>
          </CardContent>
        </Card>)}

      {!loading && !error && !done && q && (<>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Question {current + 1} of {questions.length}</span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3.5 w-3.5 text-amber-500"/>{totalPoints} pts
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div animate={{ width: `${((current) / questions.length) * 100}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full satya-gradient"/>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <Card className="border-border/60 shadow-lg">
                <CardContent className="p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", difficultyColor(q.difficulty))}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground border border-border px-2.5 py-1 rounded-full">{q.category}</span>
                    <span className="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400">+{q.points} pts</span>
                  </div>

                  {/* Headline */}
                  <div className="bg-muted/40 rounded-xl p-4 mb-5 border border-border/40">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium text-xs">Headline</p>
                    <p className="text-base font-semibold text-foreground leading-snug">"{q.headline}"</p>
                  </div>

                  {/* Hint */}
                  <div className="mb-4">
                    <button onClick={() => setShowHint((h) => !h)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <HelpCircle className="h-3.5 w-3.5"/>
                      {showHint ? "Hide hint" : "Show hint (−5 pts if correct)"}
                    </button>
                    <AnimatePresence>
                      {showHint && (<motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          💡 {q.clue}
                        </motion.p>)}
                    </AnimatePresence>
                  </div>

                  {/* Answer options */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {VERDICT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.value;
                const isCorrect = confirmed && opt.value === q.verdict;
                const isWrong = confirmed && isSelected && opt.value !== q.verdict;
                return (<button key={opt.value} disabled={confirmed} onClick={() => !confirmed && setSelected(opt.value)} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm", confirmed
                        ? isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 scale-105"
                            : isWrong
                                ? "border-red-400 bg-red-50 dark:bg-red-950/20 text-red-500 opacity-70"
                                : "border-border/40 opacity-40 bg-card"
                        : isSelected
                            ? opt.active
                            : opt.style)}>
                          <Icon className="h-6 w-6"/>
                          {opt.label}
                        </button>);
            })}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {confirmed && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className={cn("p-4 rounded-xl border mb-4 overflow-hidden", resultStyle(selected === q.verdict).bg)}>
                        <p className={cn("font-bold text-sm mb-1", resultStyle(selected === q.verdict).text)}>
                          {resultStyle(selected === q.verdict).label} — The verdict is {q.verdict}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                      </motion.div>)}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!confirmed ? (<Button onClick={confirm} disabled={!selected} className="flex-1 satya-gradient border-0 rounded-xl gap-2">
                        Submit Answer
                      </Button>) : (<Button onClick={next} className="flex-1 satya-gradient border-0 rounded-xl gap-2">
                        {current >= questions.length - 1 ? "See Results" : "Next Question"}
                        <ChevronRight className="h-4 w-4"/>
                      </Button>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Answer trail */}
          {answers.length > 0 && (<div className="flex gap-1.5 mt-4 justify-center flex-wrap">
              {answers.map((a, i) => (<div key={i} className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm", a.correct ? "bg-emerald-500" : "bg-red-400")}>
                  {i + 1}
                </div>))}
              {Array.from({ length: questions.length - answers.length }).map((_, i) => (<div key={`empty-${i}`} className="w-8 h-8 rounded-full border-2 border-dashed border-border/40"/>))}
            </div>)}
        </>)}
    </div>);
}
