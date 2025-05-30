#!/bin/bash
# Utility functions for scripts

# Define color constants
readonly RESET="\033[0m"
readonly RED="\033[0;31m"
readonly GREEN="\033[0;32m"
readonly YELLOW="\033[0;33m"
readonly BLUE="\033[0;34m"
readonly BOLD="\033[1m"

# Function for colored output
print_color() {
  local color="$1"
  local message="$2"
  echo -e "${color}${message}${RESET}"
}

# Shorthand functions for common colors
print_success() { print_color "$GREEN" "$1"; }
print_info() { print_color "$BLUE" "$1"; }
print_warning() { print_color "$YELLOW" "$1"; }
print_error() { print_color "$RED" "$1"; }

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
      # Use eval to assign the value to the variable name passed in
      eval "$var_name='$value'"
      break
    fi
  done
}

# Function to make Stripe API calls
call_stripe_api() {
  local endpoint=$1
  local method=${2:-"GET"}
  local data=$3
  local description=${4:-"API call"}
  local secret_key=$5
  
  local response=""
  
  if [[ "$method" == "GET" ]]; then
    response=$(curl -s -X "$method" "https://api.stripe.com/v1/$endpoint" -u "$secret_key:")
  else
    response=$(curl -s -X "$method" "https://api.stripe.com/v1/$endpoint" -u "$secret_key:" $data)
  fi
  
  # Check if response contains an error
  if [[ "$response" == *"error"* ]] && [[ "$response" != *"id"* ]]; then
    print_error "Failed to $description"
    if [[ "$response" == *"error"* ]]; then
      print_error "Error details:"
      
      # Extract and format the error JSON more thoroughly
      if command -v jq &>/dev/null; then
        echo "1"
        # If jq is available, use it for proper JSON formatting
        echo "$response" | jq -r '.error' 2>/dev/null || echo "$response" | jq 2>/dev/null
      else
        # Fallback to basic formatting if jq isn't available
        error_type=$(echo "$response" | grep -o '"type": *"[^"]*"' | cut -d '"' -f4)
        error_code=$(echo "$response" | grep -o '"code": *"[^"]*"' | cut -d '"' -f4)
        error_msg=$(echo "$response" | grep -o '"message": *"[^"]*"' | cut -d '"' -f4)
        echo "2"
        # Format the error output
        print_error "  Type: ${error_type:-Unknown}"
        [[ -n "$error_code" ]] && print_error "  Code: $error_code"
        print_error "  Message: ${error_msg:-Unknown error}"
      fi
    fi
    return 1
  fi
  
  echo "3"
  echo "$response"
  return 0
}

# Function to create a Stripe product
create_stripe_product() {
  local name=$1
  local type=${2:-"service"}
  local secret_key=$3
  
  print_info "Creating $name product..."
  
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
  
  print_success "$name Product created with ID: $product_id"
  echo "$product_id"
  return 0
}

# Function to create a Stripe price
create_stripe_price() {
  local product_id=$1
  local unit_amount=$2
  local currency=${3:-"usd"}
  local interval=${4:-"month"}
  local product_name=${5:-"Product"}
  local secret_key=$6
  
  print_info "Creating $product_name price..."
  
  # Make sure the product ID is valid before proceeding
  if [[ -z "$product_id" ]]; then
    local error_message="Cannot create price: Product ID is missing or invalid"
    print_error "$error_message"
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
    # Send the full error response to stderr
    echo "$response" >&2
    return 1
  fi
  
  # Extract the price ID
  local price_id=$(echo "$response" | grep -o '"id": *"[^"]*"' | head -1 | cut -d '"' -f4)
  
  # Validate that we got a price ID
  if [[ -z "$price_id" ]]; then
    local error_message="Failed to create $product_name price (no ID returned from Stripe)"
    echo "$response" >&2  # Send full response for debugging
    echo "$error_message" >&2
    return 1
  fi
  
  print_success "$product_name Price created with ID: $price_id"
  echo "$price_id"
  return 0
}

# Error handler function that will be called when any command fails
error_handler() {
  local err_code="$?"
  local last_command="${BASH_COMMAND}"
  
  # Get error output from stderr (which was redirected to temp file)
  local error_details="$(cat /tmp/stripe_error.$$.txt 2>/dev/null)"
  rm -f /tmp/stripe_error.$$.txt 2>/dev/null
  
  # Format the error message
  local error_msg="Command failed: ${last_command}"
  
  # Pass the error information to the handler
  if [[ -n "$error_details" ]]; then
    handle_error "$error_msg" "$error_details"
  else
    handle_error "$error_msg"
  fi
}

# Function to handle errors (our "catch" block)
function handle_error {
  print_error "❌ Error setting up Stripe:"
  print_error "$1 "
  
  # Check if we have a second argument with error details
  if [[ -n "$2" ]]; then
    if [[ "$2" == *"error"* ]]; then
      print_error "Error details: --"
      
      # Use jq if available for proper JSON formatting
      if command -v jq &>/dev/null; then
        echo "1"
        echo "$2" | jq -r '.error' 2>/dev/null || echo "$2" | jq 2>/dev/null
      else
        echo "2"
        # Format the JSON error message if jq is not available
        print_error "$2" | sed 's/\\n/\n/g' | sed 's/\\"/"/g' | grep -E '"type"|"code"|"message"|"param"|"doc_url"' | 
          sed -E 's/"([^"]+)":[[:space:]]*"([^"]+)",?/  \1: \2/g'
      fi
    else
      print_error "$2"
    fi
  fi
  
  exit 1
}