export interface ServerConfig {
  storageProvider: string;
  databaseProvider: string;
  billingProvider: string;
  Spaces: {
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    region?: string;
    endpoint?: string;
  };
  Stripe: {
    stripeSecretKey?: string;
    freeProductId?: string;
    freePriceId?: string;
    proProductId?: string;
    proPriceId?: string;
    webhookSecret?: string;
  };
}

export const serverConfig: ServerConfig = {
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  billingProvider: process.env.BILLING_PROVIDER || 'Stripe',
  Spaces: {
    accessKey: process.env.SPACES_KEY,
    secretKey: process.env.SPACES_SECRET,
    bucketName: process.env.SPACES_BUCKETNAME,
    region: process.env.SPACES_REGION,
    endpoint: process.env.SPACES_ENDPOINT,
  },
  Stripe: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    freeProductId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID,
    freePriceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
    proProductId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
    proPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};
