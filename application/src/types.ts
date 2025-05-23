// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: Role;
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
export type Role = 'USER' | 'ADMIN';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PENDING';

export type SubscriptionPlan = 'FREE' | 'PRO';

export interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}