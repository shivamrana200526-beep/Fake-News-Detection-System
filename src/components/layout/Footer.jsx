import { Link } from "wouter";
import { ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-12 mt-auto border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit group">
              <img
                src="/logo-mark.png"
                alt="SatyaCheck Mark"
                className="h-7 w-auto object-contain"
              />
              <span className="font-bold text-lg tracking-tight text-white">
                Satya<span className="text-emerald-400">Check</span>
              </span>
            </Link>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              An independent news verification and forensic fact-checking platform dedicated to combating disinformation, analyzing claims across 10 forensic dimensions, and upholding media literacy standards.
            </p>
            <p className="text-[11px] font-medium tracking-wider uppercase text-emerald-400/90 mt-4">
              Verify News • Build a More Informed World
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-slate-400">Verification Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/detect" className="text-slate-300 hover:text-white transition-colors">Claim Verifier</Link></li>
              <li><Link href="/forward" className="text-slate-300 hover:text-white transition-colors">Forward Analyzer</Link></li>
              <li><Link href="/credibility" className="text-slate-300 hover:text-white transition-colors">Source Index</Link></li>
              <li><Link href="/trending" className="text-slate-300 hover:text-white transition-colors">Misinformation Wire</Link></li>
              <li><Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Forensic Metrics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-3 text-slate-400">Standards & Education</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/education" className="text-slate-300 hover:text-white transition-colors">Fact-Checking Methodology</Link></li>
              <li><Link href="/quiz" className="text-slate-300 hover:text-white transition-colors">Media Literacy Quiz</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">About SatyaCheck</Link></li>
              <li>
                <a
                  href="https://www.poynter.org/ifcn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  IFCN Standards <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SatyaCheck. Built for truth, accountability, and public interest.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/education" className="hover:underline">Methodology</Link>
            <Link href="/about" className="hover:underline">Principles</Link>
            <Link href="/history" className="hover:underline">Local History</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
