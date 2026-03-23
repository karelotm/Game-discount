'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Settings, Bell, BellOff, Mail } from 'lucide-react';

interface Subscription {
  id: string;
  type: string;
  isActive: boolean;
}

const SUB_TYPES = [
  { type: 'free_games', label: 'Free Game Alerts', desc: 'Get notified when games become free' },
  { type: 'weekly_deals', label: 'Weekly Deals Digest', desc: 'Top 10 deals every Monday' },
  { type: 'sale_alerts', label: 'Sale Event Reminders', desc: 'Reminder before major Steam sales' },
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSubs();
  }, [user]);

  async function fetchSubs() {
    setLoading(true);
    try {
      const res = await fetch('/api/email/subscriptions');
      if (res.ok) setSubs(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }

  async function toggleSub(type: string) {
    const existing = subs.find((s) => s.type === type);
    if (existing?.isActive) {
      await fetch(`/api/email/subscriptions?type=${type}`, { method: 'DELETE' });
    } else {
      await fetch('/api/email/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    }
    fetchSubs();
  }

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-32 rounded-xl shimmer" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Settings className="mx-auto h-10 w-10 text-muted mb-3" />
        <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-sm text-muted">Log in to manage your account and notification preferences.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-cyan" />
        <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Account Info */}
      <section className="glass-card p-5 space-y-3">
        <h2 className="font-heading text-lg font-bold text-white">Account</h2>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted" />
          <span className="text-sm text-white">{user.email}</span>
        </div>
      </section>

      {/* Email Notifications */}
      <section className="glass-card p-5 space-y-4">
        <h2 className="font-heading text-lg font-bold text-white">Email Notifications</h2>
        <p className="text-xs text-muted">Choose which email alerts you want to receive.</p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {SUB_TYPES.map(({ type, label, desc }) => {
              const sub = subs.find((s) => s.type === type);
              const active = sub?.isActive ?? false;

              return (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-light/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-muted">{desc}</p>
                  </div>
                  <button
                    onClick={() => toggleSub(type)}
                    className={`rounded-full p-2 transition-colors ${
                      active
                        ? 'bg-cyan/10 text-cyan hover:bg-cyan/20'
                        : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {active ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
