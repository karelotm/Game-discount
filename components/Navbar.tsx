'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Gamepad2, Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-cyan">
          <Gamepad2 className="h-6 w-6" />
          <span>Steam Deals Hub</span>
        </Link>

        <div className="hidden flex-1 justify-center px-8 md:flex">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/deals" className="text-sm text-muted hover:text-cyan transition-colors">
            Deals
          </Link>
          <Link href="/calendar" className="text-sm text-muted hover:text-cyan transition-colors">
            Sale Calendar
          </Link>
        </div>

        <button
          className="md:hidden text-muted hover:text-cyan"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 px-4 py-4 md:hidden space-y-4">
          <SearchBar />
          <div className="flex flex-col gap-3">
            <Link
              href="/deals"
              className="text-sm text-muted hover:text-cyan"
              onClick={() => setMobileOpen(false)}
            >
              Deals
            </Link>
            <Link
              href="/calendar"
              className="text-sm text-muted hover:text-cyan"
              onClick={() => setMobileOpen(false)}
            >
              Sale Calendar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
