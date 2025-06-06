# Import utility functions
$ScriptPath = $MyInvocation.MyCommand.Path
$UtilsPath = Join-Path -Path (Split-Path -Parent $ScriptPath) -ChildPath "utils.ps1"
. $UtilsPath

# Prompt for Stripe keys
$STRIPE_SECRET_KEY = Read-UserInput -promptText "Enter your Stripe secret key: " -errorMessage "Stripe secret key cannot be empty. Please try again." -asSecureString

# Prompt for product names
$FREE_PRODUCT_NAME = Read-UserInput -promptText "Enter your FREE product name: " -errorMessage "FREE product name cannot be empty. Please try again."
$PRO_PRODUCT_NAME = Read-UserInput -promptText "Enter your PRO product name: " -errorMessage "PRO product name cannot be empty. Please try again."

# Initialize product IDs to empty
$FREE_PRODUCT_ID = ""
$FREE_PRICE_ID = ""
$PRO_PRICE_ID = ""
$PRO_PRODUCT_ID = ""

# Create Free and Pro products and prices
Write-Info "==============================================="
Write-Info "Creating Products and Prices in Stripe..."
Write-Info "==============================================="

try {
    $FREE_PRODUCT_ID = New-StripeProduct -name $FREE_PRODUCT_NAME -type "service" -secretKey $STRIPE_SECRET_KEY
    $FREE_PRICE_ID = New-StripePrice -productId $FREE_PRODUCT_ID -unitAmount 0 -currency "usd" -interval "month" -productName $FREE_PRODUCT_NAME -secretKey $STRIPE_SECRET_KEY
    
    $PRO_PRODUCT_ID = New-StripeProduct -name $PRO_PRODUCT_NAME -type "service" -secretKey $STRIPE_SECRET_KEY
    $PRO_PRICE_ID = New-StripePrice -productId $PRO_PRODUCT_ID -unitAmount 1000 -currency "usd" -interval "month" -productName $PRO_PRODUCT_NAME -secretKey $STRIPE_SECRET_KEY    Write-Info "==============================================="
    $PRO_GIFT_PRICE_ID = New-StripePrice -productId $PRO_PRODUCT_ID -unitAmount 0 -currency "usd" -interval "month" -productName "$PRO_PRODUCT_NAME" -secretKey $STRIPE_SECRET_KEY

    Write-Info "==============================================="
    Write-Success "✅ Stripe was setup successfully!"
    Write-Info "==============================================="
    Write-Success "The following App Platform environment variables should be set:"
    Write-Warning "- STRIPE_FREE_PRODUCT_ID : $FREE_PRODUCT_ID (FREE Product ID)"
    Write-Warning "- NEXT_PUBLIC_STRIPE_FREE_PRICE_ID : $FREE_PRICE_ID (FREE price ID)"
    Write-Warning "- STRIPE_PRO_PRODUCT_ID : $PRO_PRODUCT_ID (PRO Product ID)"
    Write-Warning "- NEXT_PUBLIC_STRIPE_PRO_PRICE_ID : $PRO_PRICE_ID (PRO price ID)"
    Write-Warning "- NEXT_PUBLIC_STRIPE_PRO_GIFT_PRICE_ID : $PRO_GIFT_PRICE_ID (PRO gift price ID)"
}
catch {
    $exitCode = Format-StripeError -ErrorRecord $_
    exit $exitCode
}

