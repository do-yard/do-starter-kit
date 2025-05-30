# Utility functions for scripts

# Functions for colored output
function Write-Success {
    param ([string]$message)
    Write-Host $message -ForegroundColor Green
}

function Write-Info {
    param ([string]$message)
    Write-Host $message -ForegroundColor Cyan
}

function Write-Warning {
    param ([string]$message)
    Write-Host $message -ForegroundColor Yellow
}

function Write-Error {
    param ([string]$message)
    Write-Host $message -ForegroundColor Red
}

# Function to prompt for input and validate it's not empty
function Prompt-For-Input {
    param (
        [string]$promptText,
        [string]$errorMessage,
        [switch]$asSecureString
    )
    $value = $null
    do {
        if ($asSecureString) {
            Write-Host $promptText -NoNewline
            $secureValue = Read-Host -AsSecureString
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
            $value = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
        }
        else {
            Write-Host $promptText -NoNewline
            $value = Read-Host
        }
        
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Warning $errorMessage
        }
    } while ([string]::IsNullOrWhiteSpace($value))
    
    return $value
}

# Function to make Stripe API calls
function Invoke-StripeApi {
    param (
        [string]$endpoint,
        [string]$method = "Get",
        [hashtable]$body = @{},
        [string]$description = "API call",
        [string]$secretKey
    )
    $uri = "https://api.stripe.com/v1/$endpoint"
    $headers = @{ Authorization = "Bearer $secretKey" }
        
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method $method -Body $body
    return $response
}

# Function to create a Stripe product
function New-StripeProduct {
    param (
        [string]$name,
        [string]$type = "service",
        [string]$secretKey
    )
    
    Write-Info "Creating product: $name"
    
    $response = Invoke-StripeApi -endpoint "products" -method "Post" -body @{ 
        name = $name
        type = $type
    } -description "create $name product" -secretKey $secretKey
    
    if (-not $response.id) {
        throw "Failed to create product (no ID returned)"
    }
    
    Write-Success "$name Product created with ID: $($response.id)"
    return $response.id
}

# Function to create a Stripe price
function New-StripePrice {
    param (
        [string]$productId,
        [string]$currency = "usd",
        [int]$unitAmount = 0,
        [string]$interval = "month",
        [string]$productName,
        [string]$secretKey
    )
    # Make sure the product ID is valid before proceeding
    if ([string]::IsNullOrWhiteSpace($productId)) {
        throw "Cannot create price: Product ID is missing or invalid"
    }
        
    $response = Invoke-StripeApi -endpoint "prices" -method "Post" -body @{
        currency              = $currency
        unit_amount           = $unitAmount
        "recurring[interval]" = $interval
        product               = $productId
    } -description "create price for $productName" -secretKey $secretKey
        
    if (-not $response.id) {
        throw "Failed to create price (no ID returned)"
    }
        
    Write-Success "$productName Price created with ID: $($response.id)"
    return $response.id
}

# Function to handle Stripe errors and provide formatted output
function Format-StripeError {
    param (
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord
    )
    
    Write-Error "❌ Error setting up Stripe:"
    
    # Show detailed error information
    if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
        try {
            # Try to parse as JSON for better formatting
            $errorJson = $ErrorRecord.ErrorDetails.Message | ConvertFrom-Json
            Write-Error "Error details:"
            if ($errorJson.error) {
                # Format Stripe API error nicely
                Write-Error "  Type: $($errorJson.error.type)"
                if ($errorJson.error.code) { Write-Error "  Code: $($errorJson.error.code)" }
                Write-Error "  Message: $($errorJson.error.message)"
                if ($errorJson.error.doc_url) { Write-Error "  Documentation: $($errorJson.error.doc_url)" }
            }
            else {
                Write-Error $ErrorRecord.ErrorDetails.Message
            }
        }
        catch {
            # If not valid JSON, just show the message
            Write-Error $ErrorRecord.ErrorDetails.Message
        }
    }
    elseif ($ErrorRecord.Exception.Message) {
        Write-Error $ErrorRecord.Exception.Message
    }
    else {
        Write-Error "An unexpected error occurred"
    }
    
    return 1  # Return exit code for convenience
}