import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-cyan">
            <Gamepad2 className="h-5 w-5" />
            <span>Steam Deals Hub</span>
          </div>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/deals" className="hover:text-cyan transition-colors">Deals</Link>
            <Link href="/calendar" className="hover:text-cyan transition-colors">Calendar</Link>
          </div>
          <p className="text-xs text-muted/60">
            Powered by CheapShark &amp; Steam. Not affiliated with Valve Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}
