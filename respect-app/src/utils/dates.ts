export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year = '1970', month = '1', day = '1'] = key.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function recentDateKeys(days: number, anchor = new Date()): string[] {
  return Array.from({ length: days }, (_, index) => toDateKey(addDays(anchor, index - days + 1)));
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric' }).format(date);
}

export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
