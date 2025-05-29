#!/bin/bash

# Prompt for Stripe public key
echo -n "Enter your Stripe public key: "
read STRIPE_PUBLIC_KEY
while [[ -z "$STRIPE_PUBLIC_KEY" ]]; do
  echo "Stripe public key cannot be empty. Please try again."
  echo -n "Enter your Stripe public key: "
  read STRIPE_PUBLIC_KEY
done

# Prompt for Stripe secret key (no echo)
while true; do
  read -s -p "Enter your Stripe secret key: " STRIPE_SECRET_KEY
  echo
  if [[ -z "$STRIPE_SECRET_KEY" ]]; then
    echo "Stripe secret key cannot be empty. Please try again."
  else
    break
  fi
done

# Prompt for product name
echo -n "Enter your free product name: "
read PRODUCT_FREE_NAME

echo -n "Enter your pro product name: "
read PRODUCT_PRO_NAME



echo "Creating Pro Product"
PRODUCT_PRO_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d name="$PRODUCT_PRO_NAME")
PRODUCT_PRO_ID=$(echo "$PRODUCT_PRO_RESPONSE" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
if [[ -z "$PRODUCT_PRO_ID" ]]; then
  echo "Failed to create product: $PRODUCT_PRO_RESPONSE"
  exit 1
fi
echo "Pro Product created with ID: $PRODUCT_PRO_ID"

echo "Creating Free Product"
PRODUCT_FREE_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d name="$PRODUCT_FREE_NAME")
PRODUCT_FREE_ID=$(echo "$PRODUCT_FREE_RESPONSE" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
if [[ -z "$PRODUCT_FREE_ID" ]]; then
  echo "Failed to create product: $PRODUCT_FREE_RESPONSE"
  exit 1
fi
echo "Free Product created with ID: $PRODUCT_FREE_ID"

echo "Creating Prices"
# Create PRO Price
PRO_PRICE_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d currency=usd \
  -d unit_amount=1000 \
  -d recurring[interval]=month \
  -d product="$PRODUCT_PRO_ID")
PRO_PRICE_ID=$(echo "$PRO_PRICE_RESPONSE" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
if [[ -z "$PRO_PRICE_ID" ]]; then
  echo "Failed to create PRO price: $PRO_PRICE_RESPONSE"
  exit 1
fi
echo "PRO Price created with ID: $PRO_PRICE_ID"

# Create Free Price
FREE_PRICE_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d currency=usd \
  -d unit_amount=0 \
  -d recurring[interval]=month \
  -d product="$PRODUCT_FREE_ID")
FREE_PRICE_ID=$(echo "$FREE_PRICE_RESPONSE" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
if [[ -z "$FREE_PRICE_ID" ]]; then
  echo "Failed to create FREE price: $FREE_PRICE_RESPONSE"
  exit 1
fi
echo "FREE Price created with ID: $FREE_PRICE_ID"

echo -e '\033[0;32mStripe was setup correctly; the following App Platform'\''s environment variables should be set:\033[0m'
echo -e "\033[0;33m- NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID : $PRODUCT_PRO_ID (PRO Product ID)\033[0m"
echo -e "\033[0;33m- NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID : $PRODUCT_FREE_ID (FREE Product ID)\033[0m"
echo -e "\033[0;33m- NEXT_PUBLIC_STRIPE_PRO_PRICE_ID : $PRO_PRICE_ID (PRO price ID)\033[0m"
echo -e "\033[0;33m- NEXT_PUBLIC_STRIPE_FREE_PRICE_ID : $FREE_PRICE_ID (FREE price ID)\033[0m"