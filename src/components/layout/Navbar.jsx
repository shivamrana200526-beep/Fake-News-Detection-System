import { Link, useLocation } from "wouter";
import { ScanSearch, Menu, X, Sun, Moon, ChevronDown, MessageCircle, Globe, Brain, TrendingUp, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
const mainLinks = [
    { href: "/", label: "Home" },
    { href: "/detect", label: "Detect" },
    { href: "/chat", label: "AI Chat", badge: "New" },
    { href: "/dashboard", label: "Dashboard" },
];
const toolLinks = [
    { href: "/forward", label: "Forward Checker", icon: MessageCircle, desc: "Check WhatsApp & Telegram messages" },
    { href: "/credibility", label: "Source Credibility", icon: Globe, desc: "Trust score for any news site" },
    { href: "/quiz", label: "Daily Quiz", icon: Brain, desc: "Test your fake news detection skills" },
    { href: "/trending", label: "Trending Fake News", icon: TrendingUp, desc: "Viral misinformation tracker" },
    { href: "/history", label: "My History", icon: History, desc: "Your past fact-checks" },
];
const mobileAllLinks = [
    { href: "/", label: "Home" },
    { href: "/detect", label: "Detect" },
    { href: "/chat", label: "AI Chat", badge: "New" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/forward", label: "Forward Checker" },
    { href: "/credibility", label: "Source Credibility" },
    { href: "/quiz", label: "Daily Quiz" },
    { href: "/trending", label: "Trending Fake News" },
    { href: "/history", label: "My History" },
    { href: "/education", label: "Education" },
    { href: "/about", label: "About" },
];
export function Navbar() {
    const [location] = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const { theme, toggle } = useTheme();
    const toolsRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        const handleClick = (e) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target)) {
                setToolsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);
    const isToolActive = toolLinks.some((t) => t.href === location);
    return (<header className={cn("fixed top-0 w-full z-50 transition-all duration-300 border-b", isScrolled
            ? "bg-background/90 backdrop-blur-xl border-border/60 shadow-sm py-3"
            : "bg-transparent border-transparent py-5")}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="satya-gradient p-2 rounded-xl text-white shadow-md group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
              <ScanSearch className="h-5 w-5"/>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">
              <span className="satya-text-gradient">Satya</span>
              <span className="text-foreground">Check</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (<Link key={link.href} href={link.href} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5", location === link.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                {link.label}
                {link.badge && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full satya-gradient text-white leading-none">
                    {link.badge}
                  </span>)}
              </Link>))}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button onClick={() => setToolsOpen((o) => !o)} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5", isToolActive || toolsOpen
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                Tools
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", toolsOpen && "rotate-180")}/>
              </button>

              {toolsOpen && (<div className="absolute top-full left-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl p-2 z-50">
                  {toolLinks.map((tool) => {
                const Icon = tool.icon;
                return (<Link key={tool.href} href={tool.href} onClick={() => setToolsOpen(false)} className={cn("flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group", location === tool.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground")}>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors", location === tool.href
                        ? "satya-gradient text-white"
                        : "bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary")}>
                          <Icon className="h-4 w-4"/>
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none mb-1">{tool.label}</p>
                          <p className="text-xs text-muted-foreground leading-snug">{tool.desc}</p>
                        </div>
                      </Link>);
            })}
                  <div className="border-t border-border/40 mt-2 pt-2 flex gap-1">
                    <Link href="/education" onClick={() => setToolsOpen(false)} className="flex-1 text-xs text-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      Education
                    </Link>
                    <Link href="/about" onClick={() => setToolsOpen(false)} className="flex-1 text-xs text-center px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      About
                    </Link>
                  </div>
                </div>)}
            </div>

            <div className="pl-3 ml-1 border-l border-border flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                {theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
              </button>
              <Link href="/detect">
                <Button className="rounded-full shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 satya-gradient border-0 text-sm">
                  Analyze Now
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile: theme + menu */}
          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              {theme === "dark" ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (<div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-xl py-4 px-4 flex flex-col gap-1 animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          {mobileAllLinks.map((link) => (<Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2", location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {link.label}
              {link.badge && (<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full satya-gradient text-white leading-none">
                  {link.badge}
                </span>)}
            </Link>))}
          <div className="pt-3 mt-2 border-t border-border">
            <Link href="/detect" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button className="w-full rounded-full satya-gradient border-0">Analyze Now</Button>
            </Link>
          </div>
        </div>)}
    </header>);
}
