# Stripe Webhooks

## Deployed apps

Stripe provides webhook events that confirm the operation done in the application, creating a subscription, updating it and canceling it.
To configure the webhooks in a deployed app, follow this instructions:

1. Get the url of your deployed app in DO App service.
2. Got to the stripe dashboard, expand the developer bar that is at the bottom of the screen
3. Click in the webhook tab
4. Click on **Add destination**
5. In the **find events** section, search for this three events and select them:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

6. Click on continue, and in the next page select the **Webhook endpoint** option. Click on continue again.
7. In the **endpoint URL** section, paste the url from step 1 with the sufix /api/webhook, like this:

- `https://sample.ondigitalocean.com/api/webhook

8. Click on **Create Destination**
9. In the webhooks section, look up for the **Signing Secret** card, and copy the secret. Use this secret for the following environment variable:
   `STRIPE_WEBHOOK_SECRET`

## Running locally

There are two options to test the webhooks integration locally: use a tunneling tool like [ngrok](#ngrok) or [forward events to a local endpoint](#forward-events-to-a-local-endpoint).

### Ngrok

To configure ngrok follow these steps:

1. Install [**ngrok**](https://ngrok.com/)
2. In a terminal run `ngrok http 3000`
   > 3000 is the port the nextjs app is running
3. Now you can follow the steps from the [Deployed App](#deployed-apps) version, from step 2 onwards. Keep in mind that in step 7 you will need to use the ngrok URL with suffix `/api/webhook`

### Forward events to a local endpoint

Follow the steps in the [Test your handler](https://docs.stripe.com/webhooks#test-webhook) section in the Stripe documentation.
