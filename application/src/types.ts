import { NextRequest, NextResponse } from 'next/server';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PENDING';

export type SubscriptionPlan = 'FREE' | 'PRO';

export interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}

export interface WithAuthOptions {
  requiredRole?: UserRole;
}

export type RouteHandler = (
  req: NextRequest,
  user: User
) => Promise<NextResponse> | NextResponse;