# Stripe Setup

This guide explains how to configure your Stripe account and automatically generate all required billing products, features, and environment variables for this project.

## 1. Create a Stripe Account & Obtain API Keys

1. Go to [Stripe](https://dashboard.stripe.com/register) and create a new account, or log in to your existing one.
2. Once logged in, switch to **Test mode** (toggle in the sidebar).
3. In the dashboard, go to **Developers** > **API keys**.
4. Copy the **Secret Key** (`sk_test_...`). You will use this key in the setup script.

## 2. Run the Stripe Setup Script

This project includes an automated script to create all required products, prices, features, and the billing portal configuration in Stripe.

### Prerequisites

- Ensure you have installed project dependencies:

```bash
npm install
```

- Ensure you have already created the .env file:

```bash
cp env-example .env
```

### Running the Setup

From your project root, run:

```bash
npm run setup:stripe
```

The script will:

- Prompt you for your **Stripe Secret Key** (it must start with `sk_test_`).
- Validate the key and automatically create products, prices, and features.
- Update the Stripe related environment variables values.

#### Variables updated in `.env`.

```env
BILLING_PROVIDER=Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PORTAL_CONFIG_ID=...
STRIPE_FREE_PRICE_ID=...
STRIPE_PRO_PRICE_ID=...
STRIPE_PRO_GIFT_PRICE_ID=...
```

> **Note:** The `STRIPE_PORTAL_CONFIG_ID` is used to configure the customer billing portal in checkout flow.

---

## 3. (Next Steps) Configure Stripe Webhooks

To enable real-time billing updates, you need to [configure Stripe webhooks](./stripe-webhooks.md) and set `STRIPE_WEBHOOK_SECRET` in your `.env` file.

---

## FAQ

**Q: What does the setup script do?**  
A: It automates the creation of all products, features, and pricing required for this SaaS, and outputs the environment variables needed for your backend and frontend.

**Q: Can I re-run the script?**  
A: Yes, the script is idempotent. It detects and re-uses existing products/features by name/lookup key.

**Q: What if I get errors or want to roll back?**  
A: If an error occurs, the script attempts to deactivate any Stripe objects it created in that run, leaving your Stripe account clean.

**Q: Do I need to edit `stripe-config.json`?**  
A: No. Only do so if you want to change the default products/features for this starter kit.

---

## Troubleshooting

- **Invalid key format:** Ensure you use a Stripe secret key (`sk_test_...`), not a publishable key.
- **Script errors out:** Check that your Stripe account is in test mode and has no naming conflicts with existing products/features.
- **.env-stripe not generated:** Fix any script errors shown in the console, then re-run the script.

---

## Need more help?

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Keys Documentation](https://stripe.com/docs/keys)
- [Project README](../README.md)
- [Webhook setup guide](./stripe-webhooks.md)

---

## Advanced: How the script works (for maintainers)

- Uses the official [stripe](https://www.npmjs.com/package/stripe) npm package.
- Reads `./setup/stripe-config.json` for products/features to provision.
- Creates each Feature, Product, Price, and associates features to products using the Stripe Entitlements API.
- Configures a Billing Portal and outputs all required IDs to `.env-stripe`.
- On error, disables created objects for a clean rollback.
