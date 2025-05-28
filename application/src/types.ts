import { USER_ROLES } from 'lib/auth/roles';

// User type
export interface User {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  image: string | null;

  role: UserRole;
  createdAt: Date;
}

// Subscription type
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  createdAt: Date;
}

// Note type
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'TRIALING';

export type SubscriptionPlan = 'FREE' | 'PRO';
