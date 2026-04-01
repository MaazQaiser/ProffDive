import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 border-b border-divider bg-surface/90 backdrop-blur-md z-50 flex items-center justify-between px-6 lg:px-12 shadow-sm">
      <Link href="/" className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
        <span className="w-2 h-2 bg-status-ready rounded-none block"></span>
        ProofDive
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="#how-it-works" className="text-muted hover:text-foreground transition-colors">How it works</Link>
        <Link href="#demo" className="text-muted hover:text-foreground transition-colors">Demo</Link>
        <Link href="#manifesto" className="text-muted hover:text-foreground transition-colors">Manifesto</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden sm:block">
          Sign In
        </Link>
        <Link href="/login" className="h-9 px-6 flex items-center justify-center bg-primary text-white text-xs uppercase tracking-widest font-medium hover:bg-teal-700 transition-colors">
          Get Started
        </Link>
      </div>
    </header>
  );
}
