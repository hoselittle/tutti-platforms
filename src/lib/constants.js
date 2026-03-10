export const USER_ROLES = {
  PIANIST: 'pianist',
  CLIENT: 'client',
  ADMIN: 'admin',
};

export const CLIENT_TYPES = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
};

export const EXAM_TYPES = {
  AMEB: 'ameb',
  HSC: 'hsc',
  OTHER: 'other',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PAID: 'paid',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
  REFUNDED: 'refunded',
};

export const JOB_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  ASSIGNED: 'assigned',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  EXPIRED: 'expired',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
};

export const COMMISSION_RATE = 0.10;

export const BOOKING_EXPIRY_HOURS = 24;
export const JOB_EXPIRY_DAYS = 14;
export const REVIEW_WINDOW_DAYS = 7;
export const ESCROW_RELEASE_HOURS = 72;

export const SIGHT_READING_LABELS = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Professional',
};

export const AMEB_GRADES = [
  'Preliminary',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
  'Certificate of Performance',
  'Associate (AMusA)',
  'Licentiate (LMusA)',
  'Fellowship',
];

export const ACTIVE_ROLE_KEY = 'tutti_active_role';