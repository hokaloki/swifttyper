import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWpm(wpm: number) {
  return Math.round(wpm)
}

export function formatAccuracy(accuracy: number) {
  return Math.round(accuracy * 100) / 100
}
