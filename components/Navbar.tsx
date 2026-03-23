'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogOut, Gift, Bookmark } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-cyan">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Steam Deals Hub" className="h-8 w-8 rounded-lg" />
            <span>Steam Deals Hub</span>
          </Link>

          <div className="hidden flex-1 justify-center px-8 md:flex">
            <SearchBar />
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/deals" className="text-sm text-muted hover:text-cyan transition-colors">
              Deals
            </Link>
            <Link href="/free-games" className="text-sm text-muted hover:text-cyan transition-colors flex items-center gap-1">
              <Gift className="h-3.5 w-3.5" /> Free
            </Link>
            <Link href="/calendar" className="text-sm text-muted hover:text-cyan transition-colors">
              Sale Calendar
            </Link>
            {user && (
              <Link href="/watchlist" className="text-sm text-muted hover:text-cyan transition-colors flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" /> Watchlist
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted hover:text-white transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="max-w-[100px] truncate">{user.email.split('@')[0]}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-surface p-1 shadow-xl">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" /> Settings
                    </Link>
                    <Link
                      href="/watchlist"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Bookmark className="h-4 w-4" /> Watchlist
                    </Link>
                    <button
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-magenta"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-lg bg-cyan/10 px-4 py-1.5 text-xs font-semibold text-cyan hover:bg-cyan/20 transition-colors"
              >
                Log In
              </button>
            )}
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
              <Link href="/deals" className="text-sm text-muted hover:text-cyan" onClick={() => setMobileOpen(false)}>
                Deals
              </Link>
              <Link href="/free-games" className="text-sm text-muted hover:text-cyan flex items-center gap-1" onClick={() => setMobileOpen(false)}>
                <Gift className="h-3.5 w-3.5" /> Free Games
              </Link>
              <Link href="/calendar" className="text-sm text-muted hover:text-cyan" onClick={() => setMobileOpen(false)}>
                Sale Calendar
              </Link>
              {user && (
                <Link href="/watchlist" className="text-sm text-muted hover:text-cyan flex items-center gap-1" onClick={() => setMobileOpen(false)}>
                  <Bookmark className="h-3.5 w-3.5" /> Watchlist
                </Link>
              )}
              {user ? (
                <>
                  <Link href="/settings" className="text-sm text-muted hover:text-cyan" onClick={() => setMobileOpen(false)}>
                    Settings
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-muted hover:text-magenta text-left">
                    Log out
                  </button>
                </>
              ) : (
                <button onClick={() => { setShowAuth(true); setMobileOpen(false); }} className="text-sm text-cyan">
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
