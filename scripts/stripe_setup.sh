#!/bin/bash

# Import utility functions - get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/utils.sh"

# Prompt for Stripe key
prompt_for_input "Enter your Stripe secret key: " "Stripe secret key cannot be empty. Please try again." "STRIPE_SECRET_KEY" "true"

# Prompt for product names
prompt_for_input "Enter your FREE product name: " "Free product name cannot be empty. Please try again." "FREE_PRODUCT_NAME" "false"
prompt_for_input "Enter your PRO product name: " "Pro product name cannot be empty. Please try again." "PRO_PRODUCT_NAME" "false"

# Initialize variables to empty
FREE_PRODUCT_ID=""
PRO_PRODUCT_ID=""
FREE_PRICE_ID=""
PRO_PRICE_ID=""

# True try-catch pattern for Bash using trap
trap 'error_handler' ERR
set -e
exec 2>/tmp/stripe_error.$$.txt
  # Create Free and Pro products and prices
  # Open a new file descriptor for logging
  exec 3> >(tee /dev/stderr)

  # Use the updated print_ functions with FD 3 for logging
  print_info "===============================================" 3
  print_info "Creating Products and Prices in Stripe..." 3
  print_info "===============================================" 3

  FREE_PRODUCT_ID=$(create_stripe_product "$FREE_PRODUCT_NAME" "service" "$STRIPE_SECRET_KEY" 3)
  FREE_PRICE_ID=$(create_stripe_price "$FREE_PRODUCT_ID" "0" "usd" "month" "$FREE_PRODUCT_NAME" "$STRIPE_SECRET_KEY" 3)
  PRO_PRODUCT_ID=$(create_stripe_product "$PRO_PRODUCT_NAME" "service" "$STRIPE_SECRET_KEY" 3)
  PRO_PRICE_ID=$(create_stripe_price "$PRO_PRODUCT_ID" "1000" "usd" "month" "$PRO_PRODUCT_NAME" "$STRIPE_SECRET_KEY" 3)

  # Close the file descriptor
  exec 3>&-

# End of "try" block - the error trap is no longer needed
exec 2>&1
trap - ERR  # Remove the trap
set +e  # Reset set -e

print_info "==============================================="
print_success "✅ Stripe was setup successfully!"
print_info "==============================================="
print_success "The following App Platform environment variables should be set:"
print_warning "- STRIPE_FREE_PRODUCT_ID : $FREE_PRODUCT_ID (FREE Product ID)"
print_warning "- NEXT_PUBLIC_STRIPE_FREE_PRICE_ID : $FREE_PRICE_ID (FREE price ID)"
print_warning "- STRIPE_PRO_PRODUCT_ID : $PRO_PRODUCT_ID (PRO Product ID)" 
print_warning "- NEXT_PUBLIC_STRIPE_PRO_PRICE_ID : $PRO_PRICE_ID (PRO price ID)"
