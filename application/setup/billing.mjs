import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'fs/promises';
import path from 'path';
import Stripe from 'stripe';

const rl = createInterface({ input, output });

const created = {
  features: [],
  products: [],
  prices: [],
};

function validateKeyFormat(key) {
  return /^sk_test_/.test(key);
}

async function readConfigFile() {
  try {
    const file = await fs.readFile(path.resolve('./setup/stripe-config.json'), 'utf8');
    return JSON.parse(file);
  } catch (err) {
    console.error('❌ Failed to read stripe-config.json.');
    throw err;
  }
}

async function attachFeatureToProduct(stripeSecret, productId, featureId, productName, featureKey) {
  const response = await fetch(`https://api.stripe.com/v1/products/${productId}/features`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      entitlement_feature: featureId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error?.message?.includes('already attached')) {
      console.log(`✅ Feature "${featureKey}" is already associated to product "${productName}".`);
    } else {
      throw new Error(`Stripe API Error: ${errorData.error?.message}`);
    }
  } else {
    console.log(`🔗 Feature "${featureKey}" associated successfully to product "${productName}".`);
  }
}

async function createFeatures(stripe, featuresConfig) {
  const createdFeatures = new Map();

  for (const feat of featuresConfig) {
    console.log(`🔧 Creating feature "${feat.name}"...`);
    try {
      const feature = await stripe.entitlements.features.create({
        name: feat.name,
        lookup_key: feat.key,
      });
      created.features.push(feature.id);
      createdFeatures.set(feat.key, feature.id);
    } catch (err) {
      if (err?.raw?.type === 'invalid_request_error' && err?.raw?.message?.includes('lookup_key')) {
        try {
          const existing = await stripe.entitlements.features.retrieve(feat.key);
          createdFeatures.set(feat.key, existing.id);
          console.log(`✅ Feature "${feat.name}" already exists.`);
        } catch (retrieveErr) {
          console.error(`❌ Failed to retrieve existing feature "${feat.name}"`);
          throw retrieveErr;
        }
      } else {
        console.error(`❌ Failed to create feature "${feat.name}"`);
        throw err;
      }
    }
  }

  return createdFeatures;
}

async function createProductsAndPrices(stripe, productsConfig, featuresMap, stripeSecret) {
  const priceEnvVars = {};

  for (const productConfig of productsConfig) {
    console.log(`🛒 Creating product "${productConfig.name}"...`);

    let product;
    try {
      product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
      });
      created.products.push(product.id);
    } catch (err) {
      if (err?.raw?.code === 'resource_already_exists') {
        console.log(`✅ Product "${productConfig.name}" already exists.`);
        const existing = (await stripe.products.list({ limit: 100 })).data.find(
          (p) => p.name === productConfig.name
        );
        if (!existing) throw new Error(`Product "${productConfig.name}" not found after conflict.`);
        product = existing;
      } else {
        throw err;
      }
    }

    const basePrice = await stripe.prices.create({
      unit_amount: productConfig.price,
      currency: productConfig.currency,
      recurring: { interval: productConfig.interval },
      product: product.id,
    });
    created.prices.push(basePrice.id);

    if (productConfig.id === 'FREE') {
      priceEnvVars.STRIPE_FREE_PRICE_ID = basePrice.id;
    } else if (productConfig.id === 'PRO') {
      priceEnvVars.STRIPE_PRO_PRICE_ID = basePrice.id;

      const giftPrice = await stripe.prices.create({
        unit_amount: 0,
        currency: productConfig.currency,
        recurring: { interval: productConfig.interval },
        product: product.id,
      });
      created.prices.push(giftPrice.id);
      priceEnvVars.STRIPE_GIFT_PRICE_ID = giftPrice.id;
    }

    for (const featKey of productConfig.features) {
      const featureId = featuresMap.get(featKey);
      if (!featureId) {
        console.warn(`⚠️ Feature "${featKey}" not found in feature map`);
        continue;
      }

      console.log(`🔗 Attaching feature "${featKey}" to "${productConfig.name}"...`);
      await attachFeatureToProduct(
        stripeSecret,
        product.id,
        featureId,
        productConfig.name,
        featKey
      );
    }
  }

  return priceEnvVars;
}

function writeEnvFile(vars, stripeSecret) {
  const lines = [
    `BILLING_PROVIDER=Stripe`,
    `STRIPE_SECRET_KEY=${stripeSecret}`,
    `STRIPE_FREE_PRICE_ID=${vars.STRIPE_FREE_PRICE_ID ?? ''}`,
    `STRIPE_PRO_PRICE_ID=${vars.STRIPE_PRO_PRICE_ID ?? ''}`,
    `STRIPE_GIFT_PRICE_ID=${vars.STRIPE_GIFT_PRICE_ID ?? ''}`,
  ];

  return fs.writeFile(path.resolve('./.env'), lines.join('\n'), 'utf8');
}

async function rollback(stripe) {
  console.log('\n⏪ Rolling back...');

  for (const priceId of [...created.prices].reverse()) {
    try {
      await stripe.prices.update(priceId, { active: false });
      console.log(`🗑️ Deactivated price ${priceId}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate price ${priceId}: ${err.message}`);
    }
  }

  for (const productId of [...created.products].reverse()) {
    try {
      await stripe.products.update(productId, { active: false });
      console.log(`🗑️ Deactivated product ${productId}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate product ${productId}: ${err.message}`);
    }
  }

  for (const featureId of [...created.features].reverse()) {
    try {
      await stripe.entitlements.features.update(featureId, { active: false });
      console.log(`🗑️ Deactivated feature ${featureId}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate feature ${featureId}: ${err.message}`);
    }
  }

  console.log('🔁 Rollback complete.\n');
}

async function main() {
  console.log('🚀 Stripe Billing Setup');
  console.log('This script assumes a clean Stripe account with no existing billing setup.\n');

  const secretKey = (
    await rl.question('👉 Enter your Stripe Secret Key (starts with sk_test_): ')
  ).trim();
  if (!validateKeyFormat(secretKey)) {
    console.error('❌ Invalid key format. It must start with sk_test_');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

  try {
    await stripe.products.list({ limit: 1 });
    console.log('✅ Stripe key is valid.\n');
  } catch (err) {
    console.error('❌ Stripe authentication failed.');
    console.error(err.message);
    process.exit(1);
  }

  try {
    const config = await readConfigFile();
    const featuresMap = await createFeatures(stripe, config.features);
    console.log('✅ All features created.\n');

    const priceEnvVars = await createProductsAndPrices(
      stripe,
      config.products,
      featuresMap,
      secretKey
    );
    console.log('✅ All products and prices created.\n');

    await writeEnvFile(priceEnvVars, secretKey);
    console.log('📄 .env file created successfully.\n');
  } catch (err) {
    console.error('❌ Setup failed:');
    console.error(err.message || err);
    await rollback(stripe);
    process.exit(1);
  }

  rl.close();
}

main();
