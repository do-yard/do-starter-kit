#!/bin/bash
# Utility functions for scripts

# Define color constants
readonly RESET="\033[0m"
readonly RED="\033[0;31m"
readonly GREEN="\033[0;32m"
readonly YELLOW="\033[0;33m"
readonly BLUE="\033[0;34m"
readonly BOLD="\033[1m"

# Function for colored output with optional file descriptor
print_color() {
  local color="$1"
  local message="$2"
  local fd=${3:-1}  # Default to stdout if no file descriptor is provided
  echo -e "${color}${message}${RESET}" >&$fd
}

# Shorthand functions for common colors with optional file descriptor
print_success() { print_color "$GREEN" "$1" "${2:-1}"; }
print_info() { print_color "$BLUE" "$1" "${2:-1}"; }
print_warning() { print_color "$YELLOW" "$1" "${2:-1}"; }
print_error() { print_color "$RED" "$1" "${2:-1}"; }

# Function to prompt for input and validate it's not empty
prompt_for_input() {
  local prompt_text="$1"
  local error_message="$2"
  local var_name="$3"
  local is_secret="$4"
  local value=""
  
  while true; do
    if [[ "$is_secret" == "true" ]]; then
      read -s -p "$prompt_text" value
      echo
    else
      echo -n "$prompt_text"
      read value
    fi
    
    if [[ -z "$value" ]]; then
      print_error "$error_message"
    else
      # Use printf -v to safely assign the value to the variable name passed in
      printf -v "$var_name" '%s' "$value"
      break
    fi
  done
}

# Global variable to store product ID
STRIPE_PRODUCT_ID=""

# Function to create a Stripe product
create_stripe_product() {
  local name=$1
  local type=${2:-"service"}
  local secret_key=$3
  local log_fd=${4:-1}  # Default to stdout if no file descriptor is provided
  
  print_info "  Creating $name product..." "$log_fd"
  
  # Get the full response from Stripe
  local response=$(curl -s -X POST "https://api.stripe.com/v1/products" \
    -u "$secret_key:" \
    -d "name=$name" \
    -d "type=$type" \
    2>/dev/null)
  
  # Check if response contains an error
  if [[ "$response" == *"error"* ]]; then
    # Send the full error response to stderr
    echo "$response" >&2
    return 1
  fi
  
  # Extract the product ID
  local product_id=$(echo "$response" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
  
  # Validate that we got a product ID
  if [[ -z "$product_id" ]]; then
    local error_message="Failed to create product for \"$name\" (no ID returned from Stripe)"
    echo "$response" >&2  # Send full response for debugging
    echo "$error_message" >&2
    return 1
  fi
  
  # Log success message
  print_success "    ✓ $name Product created with ID: $product_id" "$log_fd"
  
  # Return the product ID
  echo "$product_id"
}

# Function to create a Stripe price
create_stripe_price() {
  local product_id=$1
  local unit_amount=$2
  local currency=${3:-"usd"}
  local interval=${4:-"month"}
  local product_name=${5:-"Product"}
  local secret_key=$6
  local log_fd=${7:-1}  # Default to stdout if no file descriptor is provided

  print_info "  Creating $product_name price..." "$log_fd"

  # Make sure the product ID is valid before proceeding
  if [[ -z "$product_id" ]]; then
    local error_message="Cannot create price: Product ID is missing or invalid"
    print_error "$error_message" "$log_fd"
    echo "$error_message" >&2
    return 1
  fi

  # Make direct API call to Stripe for better error handling
  local response=$(curl -s -X POST "https://api.stripe.com/v1/prices" \
    -u "$secret_key:" \
    -d "currency=$currency" \
    -d "unit_amount=$unit_amount" \
    -d "recurring[interval]=$interval" \
    -d "product=$product_id" \
    2>/dev/null)

  # Check if response contains an error
  if [[ "$response" == *"error"* ]]; then
    echo "$response" >&2
    return 1
  fi

  # Extract the price ID
  local price_id=$(echo "$response" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)

  # Validate that we got a price ID
  if [[ -z "$price_id" ]]; then
    local error_message="Failed to create $product_name price (no ID returned from Stripe)"
    echo "$response" >&2
    echo "$error_message" >&2
    return 1
  fi

  print_success "    ✓ $product_name Price created with ID: $price_id" "$log_fd"

  echo "$price_id"
}

# Error handler function that will be called when any command fails
error_handler() {
  local err_code="$?"
  
  # Get error output from stderr (which was redirected to temp file)
  local error_details="$(cat /tmp/stripe_error.$$.txt 2>/dev/null)"
  rm -f /tmp/stripe_error.$$.txt 2>/dev/null
  
  print_error "❌ Error setting up Stripe:"
  
  # Check if we have a second argument with error details
  if [[ -n "$error_details" && "$error_details" == *"error"* ]]; then
    print_error "Error details:"
    
    # Extract error type and message from JSON
    local error_type=$(echo "$error_details" | grep -o '"type": *"[^"]*"' | head -1 | cut -d '"' -f4)
    local error_message=$(echo "$error_details" | grep -o '"message": *"[^"]*"' | head -1 | cut -d '"' -f4)
    
    # Print the formatted error info in red
    [[ -n "$error_type" ]] && print_error "  Type: $error_type"
    [[ -n "$error_message" ]] && print_error "  Message: $error_message"
  elif [[ -n "$error_details" ]]; then
    print_error "  $error_details"
  fi
  
  exit 1
}