# Prompt the user for Stripe public key
do {
    $STRIPE_PUBLIC_KEY = Read-Host "Enter your Stripe public key"
    if ([string]::IsNullOrWhiteSpace($STRIPE_PUBLIC_KEY)) {
        Write-Host "Stripe public key cannot be empty. Please try again." -ForegroundColor Yellow
    }
} while ([string]::IsNullOrWhiteSpace($STRIPE_PUBLIC_KEY))

# Prompt the user for Stripe secret key
do {
    $secureSecret = Read-Host "Enter your Stripe secret key" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
    $STRIPE_SECRET_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    if ([string]::IsNullOrWhiteSpace($STRIPE_SECRET_KEY)) {
        Write-Host "Stripe secret key cannot be empty. Please try again." -ForegroundColor Yellow
    }
} while ([string]::IsNullOrWhiteSpace($STRIPE_SECRET_KEY))

# Prompt the user for products names
$PRODUCT_FREE_NAME = Read-Host "Enter your free product name"
$PRODUCT_PRO_NAME = Read-Host "Enter your pro product name"

Write-Host "Creating Free Product"

try {
    # Create Product
    $PRODUCT_FREE_RESPONSE = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" `
      -Headers @{ Authorization = "Bearer $STRIPE_SECRET_KEY" } `
      -Method Post `
      -Body @{ name = $PRODUCT_FREE_NAME }
    $PRODUCT_FREE_ID = $PRODUCT_FREE_RESPONSE.id
    Write-Host "Free Product created with ID: $PRODUCT_FREE_ID" -ForegroundColor Green
} catch {
    Write-Host "Failed to create product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Creating Pro Product"

try {
    # Create Product
    $PRODUCT_PRO_RESPONSE = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" `
      -Headers @{ Authorization = "Bearer $STRIPE_SECRET_KEY" } `
      -Method Post `
      -Body @{ name = $PRODUCT_PRO_NAME }
    $PRODUCT_PRO_ID = $PRODUCT_PRO_RESPONSE.id
    Write-Host "Pro Product created with ID: $PRODUCT_PRO_ID" -ForegroundColor Green
} catch {
    Write-Host "Failed to create product: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Creating Prices"

try {
    # Create PRO Price
    $PRO_PRICE_RESPONSE = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
      -Headers @{ Authorization = "Bearer $STRIPE_SECRET_KEY" } `
      -Method Post `
      -Body @{
          currency = "usd"
          unit_amount = 1000
          "recurring[interval]" = "month"
          product = $PRODUCT_PRO_ID
      }
    $PRO_PRICE_ID = $PRO_PRICE_RESPONSE.id
    Write-Host "PRO Price created with ID: $PRO_PRICE_ID" -ForegroundColor Green
} catch {
    Write-Host "Failed to create PRO price: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    # Create Free Price
    $FREE_PRICE_RESPONSE = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
      -Headers @{ Authorization = "Bearer $STRIPE_SECRET_KEY" } `
      -Method Post `
      -Body @{
          currency = "usd"
          unit_amount = 0
          "recurring[interval]" = "month"
          product = $PRODUCT_FREE_ID
      }
    $FREE_PRICE_ID = $FREE_PRICE_RESPONSE.id
    Write-Host "FREE Price created with ID: $FREE_PRICE_ID" -ForegroundColor Green
} catch {
    Write-Host "Failed to create FREE price: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}


Write-Host "`nStripe was setup correctly; the following App Platform's environment variables should be set:" -ForegroundColor Green
Write-Host "- BILLING_STRIPE_PRODUCTID_PRO : $PRODUCT_PRO_ID (PRO Product ID)" -ForegroundColor Yellow
Write-Host "- BILLING_STRIPE_PRODUCTID_FREE : $PRODUCT_FREE_ID (FREE Product ID)" -ForegroundColor Yellow
Write-Host "- BILLING_STRIPE_PRICEID_PRO : $PRO_PRICE_ID (PRO price ID)" -ForegroundColor Yellow
Write-Host "- BILLING_STRIPE_PRICEID_FREE : $FREE_PRICE_ID (FREE price ID)" -ForegroundColor Yellow