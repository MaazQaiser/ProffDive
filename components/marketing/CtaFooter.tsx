import Link from "next/link";

export default function CtaFooter() {
  return (
    <section className="w-full py-32 px-6 md:px-12 flex flex-col items-center justify-center text-center bg-background border-t border-divider">
      <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-8 text-balance">
        Ready to know where you stand?
      </h2>
      <Link 
        href="/login" 
        className="flex h-12 items-center justify-center bg-primary text-white px-8 text-sm font-medium transition-colors hover:bg-primary-hover shadow-sm"
      >
        Get interview ready
      </Link>
      <div className="mt-24 text-sm text-muted/50 font-light flex gap-6 border-t border-divider pt-8 w-full justify-center max-w-4xl">
        <span>© {new Date().getFullYear()} ProofDive.</span>
        <button className="hover:text-muted transition-colors">Privacy</button>
        <button className="hover:text-muted transition-colors">Terms</button>
      </div>
    </section>
  );
}
