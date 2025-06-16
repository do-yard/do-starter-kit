import { USER_ROLES } from 'lib/auth/roles';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: UserRole;
  createdAt: Date;

  verificationToken?: string | null;
  emailVerified: boolean;
}

// Subscription type
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus | null;
  plan: SubscriptionPlan | null;
  customerId: string | null;
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

export enum SubscriptionPlanEnum {
  FREE = 'FREE',
  PRO = 'PRO',
  GIFT = 'GIFT',
}

export type SubscriptionPlan = (typeof SubscriptionPlanEnum)[keyof typeof SubscriptionPlanEnum];

export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

export type SubscriptionStatus =
  (typeof SubscriptionStatusEnum)[keyof typeof SubscriptionStatusEnum];
export interface UserWithSubscriptions extends User {
  subscription: Subscription | null;
}
