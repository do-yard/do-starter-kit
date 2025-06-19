export interface ServerConfig {
  databaseProvider: string;
  storageProvider: string;
  emailProvider: string;
  billingProvider: string;
  disableEmailVerification: boolean;
  Database: {
    url?: string;
  };
  Spaces: {
    SPACES_KEY_ID?: string;
    SPACES_KEY_SECRET?: string;
    SPACES_BUCKET_NAME?: string;
    SPACES_REGION?: string;
  };
  Resend: {
    apiKey?: string;
    fromEmail?: string;
  };
  Stripe: {
    baseURL: string;
    stripeSecretKey?: string;
    freePriceId?: string;
    proPriceId?: string;
    proGiftPriceId?: string;
    webhookSecret?: string;
    portalConfigId?: string;
  };
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  emailProvider: process.env.EMAIL_PROVIDER || 'Resend',
  billingProvider: process.env.BILLING_PROVIDER || 'Stripe',
  disableEmailVerification: process.env.DISABLE_EMAIL_VERIFICATION === 'true',
  Database: {
    url: process.env.DATABASE_URL,
  },
  Spaces: {
    SPACES_KEY_ID: process.env.SPACES_KEY_ID,
    SPACES_KEY_SECRET: process.env.SPACES_KEY_SECRET,
    SPACES_BUCKET_NAME: process.env.SPACES_BUCKET_NAME,
    SPACES_REGION: process.env.SPACES_REGION,
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER,
  },
  Stripe: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    freePriceId: process.env.STRIPE_FREE_PRICE_ID,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    proGiftPriceId: process.env.STRIPE_PRO_GIFT_PRICE_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    portalConfigId: process.env.STRIPE_PORTAL_CONFIG_ID,
  },
};
