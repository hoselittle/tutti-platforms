import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function calculateCommission(totalAmount, rate = 0.10) {
  const commission = totalAmount * rate;
  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    commission: Number(commission.toFixed(2)),
    clientPays: Number((totalAmount + commission).toFixed(2)),
  };
}