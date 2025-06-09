# Setting up Stripe

This sample application uses Stripe to manage user subscriptions. The subscription is made of two products and two prices (Free and Pro). We offer two scripts to create these resources automatically but first, you will need to generate the required Stripe credentials. Follow these steps:

1. Create a [Stripe](https://stripe.com/) account or log in if you already have one.
2. Go to your dashboard and locate the API keys card shown there.
3. Copy the **Secret key** and store it in a safe place.

## Create Stripe resources

This sample provides scripts to automatically create the required resources in Stripe. Follow these steps:

1. Open a terminal and navigate to the `./scripts` directory:

   - **Windows**: Open a `powershell` terminal
   - **Linux/Mac**: Open a `bash` terminal

2. Run the setup script:
   - **Windows**: `./stripe_setup.ps1`
   - **Linux/Mac**: `./stripe_setup.sh`

The script will ask you for the Stripe key you created before:

1. Enter your Stripe secret key and press enter.
2. Enter a name for your free product and press enter.
3. Enter a name for your pro product and press enter.

After this, the script will create two products with your specified names and two prices (one free and one paid), linked to those products.
In the script outputs, you will see the respective IDs for the products and the prices. _Use these IDs in the deployment templates as the required environment variables_:

- STRIPE_FREE_PRODUCT_ID
- NEXT_PUBLIC_STRIPE_FREE_PRICE_ID
- STRIPE_PRO_PRODUCT_ID
- NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
- STRIPE_PRO_GIFT_PRICE_ID

Also add the following environment variable, using the secret you obtained in step **3** of [Setting up Stripe](#setting-up-stripe).

- STRIPE_SECRET_KEY
