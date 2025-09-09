export default function Footer() {
  return (
  <footer className="mt-8 sm:mt-10 border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-center text-sm text-[color:var(--muted)]">
        <span>© {new Date().getFullYear()} Mini‑SaaS</span>
      </div>
    </footer>
  );
}
