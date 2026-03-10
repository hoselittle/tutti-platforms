// src/lib/utils.js
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

// ✅ NEW — Booking status badge variant
export function getStatusVariant(status) {
  switch (status) {
    case 'pending':   return 'warning';
    case 'accepted':  return 'info';
    case 'paid':      return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    case 'disputed':  return 'danger';
    case 'refunded':  return 'default';
    default:          return 'default';
  }
}

// ✅ NEW — Job status badge variant
export function getJobStatusVariant(status) {
  switch (status) {
    case 'open':      return 'success';
    case 'assigned':  return 'info';
    case 'in_review': return 'warning';
    case 'completed': return 'default';
    case 'closed':    return 'default';
    case 'expired':   return 'danger';
    default:          return 'default';
  }
}