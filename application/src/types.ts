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

// Enums for Role, SubscriptionStatus, and SubscriptionPlan
export type UserRole = 'USER' | 'ADMIN';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'TRIALING';

export type SubscriptionPlan = 'FREE' | 'PRO';
