import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uid = () => Math.random().toString(36).slice(2, 9);
export const today = () => new Date().toISOString().split('T')[0];

export const parseYMD = (d: string | Date | undefined) => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  const match = String(d).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(d);
};

export const fmt = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export const fmtDate = (d: string | Date | undefined) => {
  if (!d) return '';
  const dt = parseYMD(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
};

export const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export const daysUntil = (d: string) => {
  const dt = parseYMD(d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  return Math.ceil((dt.getTime() - now.getTime()) / 86400000);
};

/**
 * Compresses a base64 image string to save space in LocalStorage
 */
export const compressImage = (base64Str: string, maxWidth = 1000, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else if (base64Str.length < 100000) {
        // If image is already small (< 100KB), return as is to save processing
        resolve(base64Str);
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Using jpeg to optimize for size over transparency
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};
