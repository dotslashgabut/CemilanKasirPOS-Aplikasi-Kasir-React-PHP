import { PriceType, Product } from "./types";

export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(dateString));
};

export const formatDateDateOnly = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(dateString));
};

export const getPriceByType = (product: Product, type: PriceType): number => {
  switch (type) {
    case PriceType.WHOLESALE: return product.priceWholesale;
    case PriceType.GENERAL: return product.priceGeneral;
    case PriceType.PROMO: return product.pricePromo || 0; // No fallback, return 0 if not set
    case PriceType.RETAIL: return product.priceRetail;
    default: return product.priceRetail;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined') {
    // Modern secure method
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for slightly older browsers that have crypto but not randomUUID
    if (crypto.getRandomValues) {
      const buff = new Uint8Array(16);
      crypto.getRandomValues(buff);
      buff[6] = (buff[6] & 0x0f) | 0x40; // Version 4
      buff[8] = (buff[8] & 0x3f) | 0x80; // Variant 10
      return [...buff].map((b, i) => {
        const hex = b.toString(16).padStart(2, '0');
        return (i === 4 || i === 6 || i === 8 || i === 10) ? '-' + hex : hex;
      }).join('');
    }
  }

  // Final fallback (should ideally throw error in security-critical apps, but keeping for compatibility if really needed)
  console.warn("Secure crypto not available. Using weak random fallback.");
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateSKU = (): string => {
  // Simple timestamp based SKU + random 3 digits
  const now = new Date();
  const timePart = now.getTime().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `899${timePart}${randomPart}`;
};

export const toMySQLDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const compressImage = (file: File, size: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context not available');
          return;
        }

        // Square crop logic (Cover)
        let width = img.width;
        let height = img.height;
        let x = 0;
        let y = 0;

        if (width > height) {
          // Landscape: Scale height to target size
          const scale = size / height;
          const scaledWidth = width * scale;
          const scaledHeight = size;

          // Center crop x
          x = (size - scaledWidth) / 2;

          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, x, 0, scaledWidth, scaledHeight);
        } else {
          // Portrait: Scale width to target size
          const scale = size / width;
          const scaledWidth = size;
          const scaledHeight = height * scale;

          // Center crop y
          y = (size - scaledHeight) / 2;

          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, y, scaledWidth, scaledHeight);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};