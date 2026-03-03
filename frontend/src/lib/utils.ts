import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== Currency & Number Formatting ====================

const CURRENCY_SYMBOL = '₹';

/**
 * Format number as currency
 */
export function formatCurrency(value: number | string, symbol = CURRENCY_SYMBOL, decimals = 2) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return `${symbol}0.00`;
  }

  return `${symbol}${num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number | string, decimals = 2) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || !isFinite(num)) {
    return '0.00%';
  }

  return `${num.toFixed(decimals)}%`;
}

/**
 * Safe number parsing
 */
export function safeParseNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

/**
 * Validate positive number
 */
export function isValidPositiveNumber(value: any): boolean {
  const num = safeParseNumber(value);
  return num > 0;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null, format: 'short' | 'long' | 'numeric' = 'short'): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const options: Record<string, any> = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
  };

  return dateObj.toLocaleDateString('en-IN', options[format] || options.short);
}

/**
 * Calculate years between two dates
 */
export function getYearsDifference(startDate: Date | string, endDate: Date | string = new Date()): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const years = (end.getTime() - start.getTime()) / msPerYear;
  return Math.max(0, years);
}

/**
 * Calculate trend
 */
export function calculateTrend(current: number | string, previous: number | string) {
  const curr = safeParseNumber(current, 0);
  const prev = safeParseNumber(previous, 0);

  if (prev === 0) {
    return {
      direction: 'neutral',
      percentage: 0,
      color: 'text-gray-500',
      icon: 'minus',
    };
  }

  const percentage = ((curr - prev) / prev) * 100;
  const roundedPercent = Math.round(percentage * 100) / 100;

  if (roundedPercent > 0) {
    return {
      direction: 'up',
      percentage: roundedPercent,
      color: 'text-green-600',
      icon: 'arrow-up',
    };
  }

  if (roundedPercent < 0) {
    return {
      direction: 'down',
      percentage: Math.abs(roundedPercent),
      color: 'text-red-600',
      icon: 'arrow-down',
    };
  }

  return {
    direction: 'neutral',
    percentage: 0,
    color: 'text-gray-500',
    icon: 'minus',
  };
}

/**
 * Round number to specific decimal places
 */
export function roundNumber(value: number | string, decimals = 2): number {
  const num = safeParseNumber(value);
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Add thousands separator to number
 */
export function addThousandsSeparator(value: number | string): string {
  const num = safeParseNumber(value, 0);
  return num.toLocaleString('en-IN');
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get color based on value polarity
 */
export function getValueColor(value: number | string, colors: Record<string, string> = {}) {
  const num = safeParseNumber(value, 0);
  const defaultColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const finalColors = { ...defaultColors, ...colors };

  if (num > 0) return finalColors.positive;
  if (num < 0) return finalColors.negative;
  return finalColors.neutral;
}

/**
 * Validate form data
 */
export function validateFormData(data: Record<string, any>, requiredFields: string[] = []) {
  const errors: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      errors.push(`${toTitleCase(field)} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay = 300) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit = 300) {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

