import { Link, useLocation } from "wouter";
import { Menu, X, Sun, Moon, ChevronDown, MessageCircle, Globe, Brain, TrendingUp, History, ShieldAlert } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/detect", label: "Verify Claim" },
  { href: "/chat", label: "Assistant" },
  { href: "/dashboard", label: "Metrics" },
];

const toolLinks = [
  { href: "/forward", label: "Forward Analyzer", icon: MessageCircle, desc: "Inspect viral WhatsApp & Telegram forwards" },
  { href: "/credibility", label: "Source Index", icon: Globe, desc: "Domain credibility & bias ratings" },
  { href: "/trending", label: "Misinformation Wire", icon: TrendingUp, desc: "Monitored rumors circulating now" },
  { href: "/quiz", label: "Literacy Quiz", icon: Brain, desc: "Interactive verification training" },
  { href: "/history", label: "Verification Log", icon: History, desc: "Your previously verified claims" },
];

const mobileAllLinks = [
  { href: "/", label: "Home" },
  { href: "/detect", label: "Verify Claim" },
  { href: "/chat", label: "Assistant" },
  { href: "/dashboard", label: "Metrics & Data" },
  { href: "/forward", label: "Forward Analyzer" },
  { href: "/credibility", label: "Source Index" },
  { href: "/trending", label: "Misinformation Wire" },
  { href: "/quiz", label: "Literacy Quiz" },
  { href: "/history", label: "Verification Log" },
  { href: "/education", label: "Methodology & Standards" },
  { href: "/about", label: "About SatyaCheck" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const toolsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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

  return (
    <header className={cn(
      "sticky top-0 w-full z-50 transition-colors duration-200 border-b",
      isScrolled
        ? "bg-background/95 backdrop-blur-md border-border shadow-xs py-2.5"
        : "bg-background/95 backdrop-blur-sm border-border/80 py-3"
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo Integration */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src={theme === "dark" ? "/logo-horizontal-dark.png" : "/logo-horizontal.png"}
              alt="SatyaCheck"
              className="h-8 md:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5">
            {mainLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen((o) => !o)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                  isToolActive || toolsOpen
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                Tools
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", toolsOpen && "rotate-180")} />
              </button>

              {toolsOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-72 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Forensic Toolkit
                  </div>
                  {toolLinks.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = location === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setToolsOpen(false)}
                        className={cn(
                          "flex items-start gap-2.5 px-2.5 py-2 rounded-md transition-colors",
                          isActive
                            ? "bg-muted text-primary"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 border text-xs",
                          isActive
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted border-border text-muted-foreground"
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold leading-tight">{tool.label}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{tool.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="border-t border-border mt-1.5 pt-1.5 flex gap-1 text-[11px] text-muted-foreground">
                    <Link href="/education" onClick={() => setToolsOpen(false)} className="flex-1 px-2 py-1 hover:text-foreground hover:bg-muted rounded text-center">
                      Methodology
                    </Link>
                    <Link href="/about" onClick={() => setToolsOpen(false)} className="flex-1 px-2 py-1 hover:text-foreground hover:bg-muted rounded text-center">
                      Standards & About
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right actions: Theme + Primary CTA */}
            <div className="pl-3 ml-2 border-l border-border flex items-center gap-2">
              <button
                onClick={toggle}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Link href="/detect">
                <Button size="sm" className="h-8.5 px-4 rounded-md font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs">
                  Verify Content
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 shadow-md flex flex-col gap-1">
          {mobileAllLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-border">
            <Link href="/detect" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button className="w-full h-9 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                Verify Content
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
