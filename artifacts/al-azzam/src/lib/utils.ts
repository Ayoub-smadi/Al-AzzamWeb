import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, lang: 'ar' | 'en') {
  const strPrice = price.toLocaleString('en-US');
  return lang === 'ar' ? `${strPrice} ر.س` : `${strPrice} SAR`;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('azzam_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
