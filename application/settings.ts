export interface ServerConfig {
  databaseProvider: string;
  storageProvider: string;
  emailProvider: string;
  billingProvider: string;
  baseURL: string;
  Spaces: {
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    region?: string;
    endpoint?: string;
  };
  Resend: {
    apiKey?: string;
    fromEmail?: string;
  };
  Stripe: {
    stripeSecretKey?: string;
    freeProductId?: string;
    freePriceId?: string;
    proProductId?: string;
    proPriceId?: string;
    proGiftPriceId?: string;
    webhookSecret?: string;
  };
}

export const serverConfig: ServerConfig = {
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  emailProvider: process.env.EMAIL_PROVIDER || 'Resend',
  billingProvider: process.env.BILLING_PROVIDER || 'Stripe',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  Spaces: {
    accessKey: process.env.SPACES_KEY,
    secretKey: process.env.SPACES_SECRET,
    bucketName: process.env.SPACES_BUCKETNAME,
    region: process.env.SPACES_REGION,
    endpoint: process.env.SPACES_ENDPOINT,
  },
  Resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_EMAIL_SENDER,
  },
  Stripe: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    freeProductId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID,
    freePriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
    proProductId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
    proPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    proGiftPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_GIFT_PRICE_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};
