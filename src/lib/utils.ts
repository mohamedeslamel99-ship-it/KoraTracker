import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const formatArabicGoals = (count: number | string): string => {
  const number = Number(count);

  if (number === 1) return "هدف واحد";
  if (number === 2) return "هدفين";
  if (number >= 3 && number <= 10) return `${number} أهداف`;
  if (number >= 11 && number <= 99) return `${number} هدفاً`;
  
  return `${number} هدف`; 
};