import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BrainCircuit, Search, Share2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
const guides = [
    {
        icon: <Search className="h-6 w-6"/>,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        title: "Check the Source",
        content: "Always examine the URL and domain. Satirical or imposter sites often use URLs strikingly similar to legitimate news organizations (e.g., abcnews.com.co instead of abcnews.go.com). Look for an \"About\" page and editorial guidelines."
    },
    {
        icon: <BrainCircuit className="h-6 w-6"/>,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        title: "Analyze the Emotional Tone",
        content: "Fake news is specifically crafted to trigger strong emotional responses — outrage, fear, or extreme validation. If a headline makes you immediately furious or elated, pause and verify through other sources before reacting or sharing."
    },
    {
        icon: <Shield className="h-6 w-6"/>,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        title: "Verify Images & Videos",
        content: "AI-generated images often have telltale signs: distorted hands or fingers, illegible background text, asymmetrical features, and inconsistent lighting. Use reverse image search or our SatyaCheck image analysis tool to verify."
    },
    {
        icon: <Share2 className="h-6 w-6"/>,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        title: "Pause Before Sharing",
        content: "Misinformation spreads because people share before reading past the headline. Studies show that 59% of links are shared without clicking through. Be a responsible digital citizen — verify facts using multiple credible sources first."
    }
];
const infoTypes = [
    {
        icon: <AlertCircle className="h-5 w-5 text-amber-500"/>,
        type: "Misinformation",
        desc: "False information shared without malicious intent. Often the result of misunderstanding, misremembering, or poor fact-checking.",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        border: "border-amber-200 dark:border-amber-900"
    },
    {
        icon: <XCircle className="h-5 w-5 text-red-500"/>,
        type: "Disinformation",
        desc: "False information deliberately created and disseminated to deceive, manipulate public opinion, or cause harm.",
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-900"
    },
    {
        icon: <CheckCircle className="h-5 w-5 text-blue-500"/>,
        type: "Malinformation",
        desc: "Genuine information used to cause harm — typically by moving private information into the public sphere for malicious purposes.",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-900"
    }
];
export default function Education() {
    return (<div className="container mx-auto max-w-5xl px-4 space-y-20">

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden shadow-2xl mt-4">
        <div className="satya-gradient absolute inset-0 opacity-90"/>
        <div className="relative z-10 p-10 md:p-16 max-w-2xl text-white">
          <Badge className="bg-white/20 text-white mb-6 backdrop-blur-md border-white/30 hover:bg-white/20">Media Literacy Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Equip Yourself<br />with the Truth</h1>
          <p className="text-lg opacity-90 leading-relaxed">
            In an era of deepfakes and rapid misinformation, critical thinking is your strongest shield. Learn how to identify, verify, and report misleading content before it spreads.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10">
          <div className="absolute bottom-8 right-8 w-48 h-48 rounded-full border-4 border-white"/>
          <div className="absolute bottom-16 right-16 w-32 h-32 rounded-full border-4 border-white"/>
          <div className="absolute bottom-24 right-24 w-16 h-16 rounded-full border-4 border-white"/>
        </div>
      </motion.section>

      {/* Guide Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 block">Practical Guide</span>
          <h2 className="text-3xl font-bold text-foreground">4 Habits of Media-Literate People</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((item, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className={`${item.bg} w-12 h-12 rounded-xl flex items-center justify-center ${item.color} mb-4`}>
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.content}</p>
                </CardContent>
              </Card>
            </motion.div>))}
        </div>
      </section>

      {/* Anatomy of Fake News */}
      <section className="space-y-10">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 block">Understanding the Problem</span>
          <h2 className="text-3xl font-bold text-foreground">The Anatomy of Fake News</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Misinformation isn't a single thing — it exists on a spectrum from unintentional errors to deliberately crafted propaganda. Understanding these categories is the first step in combating them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoTypes.map((type, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`p-6 rounded-2xl border ${type.bg} ${type.border} space-y-3`}>
              <div className="flex items-center gap-3">
                {type.icon}
                <h3 className="text-lg font-bold text-foreground">{type.type}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{type.desc}</p>
            </motion.div>))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="rounded-3xl border border-border bg-muted/20 p-10 md:p-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Why This Matters</h2>
          <p className="text-muted-foreground mt-3">The scale of misinformation in the modern world.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { stat: "6x", label: "Fake news spreads 6× faster than real news on social media", source: "MIT Sloan, 2018" },
            { stat: "59%", label: "Of links shared on social media are never clicked through", source: "Columbia University" },
            { stat: "126M", label: "Americans exposed to Russian disinformation on Facebook in 2016", source: "Senate Intelligence Committee" },
        ].map((item, i) => (<div key={i} className="text-center space-y-2">
              <div className="text-5xl font-bold satya-text-gradient font-serif">{item.stat}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.label}</p>
              <span className="text-xs text-muted-foreground/60 italic">— {item.source}</span>
            </div>))}
        </div>
      </section>
    </div>);
}
