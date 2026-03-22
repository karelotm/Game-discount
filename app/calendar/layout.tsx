import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Steam Sale Calendar 2026 — All Upcoming Sales & Events',
  description:
    'Complete Steam sale calendar for 2026. Know exactly when the next Summer Sale, Winter Sale, and themed festivals start. Set reminders and never miss a deal.',
  openGraph: {
    title: 'Steam Sale Calendar 2026',
    description: 'All upcoming Steam sales and themed festival events with countdown timers.',
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
