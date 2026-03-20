export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

export function formatSteamPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateDiscount(original: string | number, sale: string | number): number {
  const orig = typeof original === 'string' ? parseFloat(original) : original;
  const s = typeof sale === 'string' ? parseFloat(sale) : sale;
  if (orig === 0) return 0;
  return Math.round(((orig - s) / orig) * 100);
}

export function formatDate(timestamp: number): string {
  if (timestamp === 0) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimeRemaining(endDate: string | number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const end = typeof endDate === 'string' ? new Date(endDate).getTime() : endDate * 1000;
  const total = end - Date.now();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function getRatingColor(percent: string | number): string {
  const num = typeof percent === 'string' ? parseInt(percent) : percent;
  if (num >= 80) return 'text-green-400';
  if (num >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
