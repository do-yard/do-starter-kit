# Setting up Stripe

This sample application uses Stripe to manage user subscriptions. The subscription is made of two products and two prices (Free and Pro). We offer two scripts to create these resources automatically but first, you will need to generate the required Stripe credentials. Follow these steps:

1. Create a [Stripe](https://stripe.com/) account or log in if you already have one.
2. Go to your dashboard and locate the API keys card shown there.
3. Copy the **Publishable key** and the **Secret key** and store them in a safe place.

## Create Stripe resources

This sample presents you with a PowerShell script if you run on Windows and bash script if run in Linux/Mac to create the required resources in Stripe. Follow these steps:

### For Windows users

1. Open a `powershell` terminal and cd in to the `./scripts` directory
2. Run the script with the command `./stripe_setup.ps1`

### For Linux/Mac users

1. Open a `bash` terminal and cd in to the `./scripts` directory
2. Run the script with the command `./stripe_setup.sh`

The script will ask you for the Stripe's key you created before:

1. Enter your Stripe public key and press enter.
2. Enter your Stripe secret key and press enter.
3. Enter a name for your products and press enter.

After this the script will create a product with your product name and two prices, one free and another pro, linked to that product.
In the script outputs you will see the respective IDs for the product and the prices. _Use this IDs in the deployment templates as the required environment variables_:

- NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID
- NEXT_PUBLIC_STRIPE_FREE_PRICE_ID
- NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID
- NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
