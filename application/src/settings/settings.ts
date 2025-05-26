export interface ServerConfig {
  storageProvider: string;
  databaseProvider: string;
  Spaces: {
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
    region?: string;
    endpoint?: string;
  };
  Stripe: {
    stripeProductId?: string;
    stripeProPriceId?: string;
    stripeFreePriceId?: string;
  };
}

export const serverConfig: ServerConfig = {
  storageProvider: process.env.STORAGE_PROVIDER || 'Spaces',
  databaseProvider: process.env.DATABASE_PROVIDER || 'Postgres',
  Spaces: {
    accessKey: process.env.SPACES_KEY,
    secretKey: process.env.SPACES_SECRET,
    bucketName: process.env.SPACES_BUCKETNAME,
    region: process.env.SPACES_REGION,
    endpoint: process.env.SPACES_ENDPOINT,
  },
  Stripe: {
    stripeProductId: process.env.BILLING_STRIPE_PRODUCTID,
    stripeProPriceId: process.env.BILLING_STRIPE_PRICEID_PRO,
    stripeFreePriceId: process.env.BILLING_STRIPE_PRICEID_FREE,
  },
};
