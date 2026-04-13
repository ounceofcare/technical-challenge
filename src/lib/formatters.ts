import { format, formatDistanceToNow } from "date-fns";

export function formatDate(epoch: number): string {
  return format(new Date(epoch * 1000), "MMM d, yyyy");
}

export function formatDateTime(epoch: number): string {
  return format(new Date(epoch * 1000), "MMM d, yyyy h:mm a");
}

export function formatTime(epoch: number): string {
  return format(new Date(epoch * 1000), "h:mm a");
}

export function formatRelative(epoch: number): string {
  return formatDistanceToNow(new Date(epoch * 1000), { addSuffix: true });
}

export function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  return phone;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
