import { Link } from "wouter";
import { ScanSearch, ExternalLink } from "lucide-react";
export function Footer() {
    return (<footer className="bg-foreground text-background py-14 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="satya-gradient p-2 rounded-xl text-white shadow-md">
                <ScanSearch className="h-5 w-5"/>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-background">
                Satya<span className="opacity-60">Check</span>
              </span>
            </Link>
            <p className="text-background/60 max-w-sm leading-relaxed text-sm">
              Empowering global citizens with dual-AI media literacy and real-time fake news detection. <em>Satya</em> means truth — and we're committed to it.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span className="text-xs text-background/40 uppercase tracking-wider font-medium">Powered by</span>
              <span className="text-xs text-background/60 font-semibold">OpenAI & Gemini</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-5 text-background/50">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-background/60 hover:text-background transition-colors text-sm">Home</Link></li>
              <li><Link href="/detect" className="text-background/60 hover:text-background transition-colors text-sm">Detect News</Link></li>
              <li><Link href="/dashboard" className="text-background/60 hover:text-background transition-colors text-sm">Live Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-5 text-background/50">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/education" className="text-background/60 hover:text-background transition-colors text-sm">Education Hub</Link></li>
              <li><Link href="/about" className="text-background/60 hover:text-background transition-colors text-sm">About the Project</Link></li>
              <li>
                <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer" className="text-background/60 hover:text-background transition-colors text-sm inline-flex items-center gap-1.5">
                  UN SDGs <ExternalLink className="h-3 w-3"/>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/35">
          <p>© {new Date().getFullYear()} SatyaCheck. Built for truth, transparency, and a better world.</p>
          <p>Aligned with UN SDGs 4, 9, 10 & 16</p>
        </div>
      </div>
    </footer>);
}
