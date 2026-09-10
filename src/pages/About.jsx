import { Card, CardContent } from "@/components/ui/card";
import { ScanSearch, Target, Layers, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
const pillars = [
    {
        icon: <Target className="h-6 w-6 text-primary"/>,
        title: "Our Mission",
        body: "In an age where information moves at the speed of light, falsehoods can outpace the truth. Our mission is to democratize access to advanced forensic analysis tools — empowering journalists, educators, and everyday users to verify claims, debunk deepfakes, and stop misinformation in its tracks."
    },
    {
        icon: <Layers className="h-6 w-6 text-violet-500"/>,
        title: "How It Works",
        body: "SatyaCheck uses a dual-engine AI architecture. OpenAI's advanced reasoning provides deep textual and contextual analysis, cross-referenced with Google Gemini for independent verification and visual forensics. This multi-layered approach ensures rigorous, unbiased fact-checking you can trust."
    },
    {
        icon: <Globe2 className="h-6 w-6 text-emerald-500"/>,
        title: "Global Alignment",
        body: "Every analysis performed on SatyaCheck contributes to a more informed global citizenry. We are proud to align with the United Nations Sustainable Development Goals — specifically SDG 4 (Quality Education), SDG 9 (Innovation), SDG 10 (Reduced Inequalities), and SDG 16 (Peace & Justice)."
    }
];
export default function About() {
    return (<div className="container mx-auto max-w-4xl px-4 py-8 space-y-16">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 pt-4">
        <div className="mx-auto w-20 h-20 satya-gradient rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/25">
          <ScanSearch className="h-10 w-10 text-white"/>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About SatyaCheck</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A dedicated initiative to combat digital misinformation and uphold the integrity of global media through cutting-edge AI analysis. <em>Satya</em> (सत्य) means <strong>Truth</strong> in Sanskrit.
        </p>
      </motion.div>

      {/* Mission Cards */}
      <div className="space-y-6">
        {pillars.map((pillar, i) => (<motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 flex gap-6">
                <div className="p-3 rounded-xl bg-muted h-fit shrink-0">
                  {pillar.icon}
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground">{pillar.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{pillar.body}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      {/* Technology Stack */}
      <div className="rounded-3xl border border-border bg-muted/20 p-8 md:p-12 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Powered by Best-in-Class AI</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Two independent AI engines. One unified verdict. Zero room for misinformation.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">GPT</span>
              </div>
              <h3 className="font-bold text-foreground">OpenAI</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Primary analysis engine. Deep textual reasoning, contextual understanding, and sentiment analysis.</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">GEM</span>
              </div>
              <h3 className="font-bold text-foreground">Google Gemini</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Independent verification engine. Multimodal analysis including images, cross-referencing, and fact-checking.</p>
          </div>
        </div>
      </div>

      {/* SDGs */}
      <div className="space-y-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">Aligned with Global Goals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { img: "04", title: "Quality Education", desc: "Promoting media literacy and critical thinking." },
            { img: "09", title: "Industry & Innovation", desc: "Building resilient AI infrastructure." },
            { img: "10", title: "Reduced Inequalities", desc: "Equal access to truth for all." },
            { img: "16", title: "Peace & Justice", desc: "Transparent, strong institutions." },
        ].map((sdg, i) => (<motion.div key={sdg.img} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group flex flex-col items-center text-center gap-4">
              <div className="relative overflow-hidden rounded-2xl shadow-md border border-border group-hover:shadow-xl transition-all duration-300">
                <img src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${sdg.img}.jpg`} alt={sdg.title} className="w-full h-auto aspect-square object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">{sdg.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{sdg.desc}</p>
              </div>
            </motion.div>))}
        </div>
      </div>
    </div>);
}
