import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateInput: string | number | Date): string {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  const future = diffMs < 0
  const absMs = Math.abs(diffMs)

  const units = [
    { label: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { label: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { label: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { label: "day", ms: 1000 * 60 * 60 * 24 },
    { label: "hour", ms: 1000 * 60 * 60 },
    { label: "minute", ms: 1000 * 60 },
  ] as const

  if (absMs < 1000 * 60) return future ? "in a moment" : "just now"

  for (const unit of units) {
    if (absMs >= unit.ms) {
      const value = Math.floor(absMs / unit.ms)
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
      return rtf.format(future ? value : -value, unit.label)
    }
  }

  return future ? "soon" : "just now"
}
