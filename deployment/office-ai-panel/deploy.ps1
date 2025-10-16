# Office AI Panel - Deployment Script (PowerShell)
# Deploys Azure Function App infrastructure and code

$ErrorActionPreference = "Stop"

# Configuration
$RESOURCE_GROUP = "rg-office-ai-panel-prod"
$LOCATION = "eastus2"
$BICEP_FILE = "main.bicep"
$PARAMETERS_FILE = "parameters.json"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Office AI Panel - Azure Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Azure
Write-Host "Checking Azure login..." -ForegroundColor Yellow
try {
    $account = az account show 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✓ Azure login verified" -ForegroundColor Green
} catch {
    Write-Host "Error: Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Display current subscription
$SUBSCRIPTION_NAME = az account show --query name -o tsv
Write-Host "Current subscription: $SUBSCRIPTION_NAME" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Continue with this subscription? (y/n)"
if ($continue -ne 'y' -and $continue -ne 'Y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Create Resource Group
Write-Host ""
Write-Host "Step 1: Creating Resource Group..." -ForegroundColor Yellow
try {
    az group show --name $RESOURCE_GROUP 2>&1 | Out-Null
    Write-Host "✓ Resource Group '$RESOURCE_GROUP' already exists" -ForegroundColor Green
} catch {
    az group create --name $RESOURCE_GROUP --location $LOCATION
    Write-Host "✓ Resource Group '$RESOURCE_GROUP' created" -ForegroundColor Green
}

# Validate Bicep template
Write-Host ""
Write-Host "Step 2: Validating Bicep template..." -ForegroundColor Yellow
az deployment group validate `
    --resource-group $RESOURCE_GROUP `
    --template-file $BICEP_FILE `
    --parameters $PARAMETERS_FILE

Write-Host "✓ Bicep template validation passed" -ForegroundColor Green

# Deploy infrastructure
Write-Host ""
Write-Host "Step 3: Deploying infrastructure..." -ForegroundColor Yellow
Write-Host "This will create:" -ForegroundColor Cyan
Write-Host "  - Storage Account"
Write-Host "  - App Service Plan (Consumption)"
Write-Host "  - Application Insights"
Write-Host "  - Function App"
Write-Host ""

$DEPLOYMENT_OUTPUT = az deployment group create `
    --resource-group $RESOURCE_GROUP `
    --template-file $BICEP_FILE `
    --parameters $PARAMETERS_FILE `
    --query properties.outputs `
    -o json | ConvertFrom-Json

Write-Host "✓ Infrastructure deployed successfully" -ForegroundColor Green

# Extract outputs
$FUNCTION_APP_NAME = $DEPLOYMENT_OUTPUT.functionAppName.value
$FUNCTION_APP_URL = $DEPLOYMENT_OUTPUT.functionAppUrl.value

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Function App Name: $FUNCTION_APP_NAME" -ForegroundColor White
Write-Host "Function App URL:  $FUNCTION_APP_URL" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy function code:" -ForegroundColor Cyan
Write-Host "   cd ..\..\projects\office-ai-panel\api"
Write-Host "   func azure functionapp publish $FUNCTION_APP_NAME"
Write-Host ""
Write-Host "2. Test endpoints:" -ForegroundColor Cyan
Write-Host "   curl $FUNCTION_APP_URL/api/characters"
Write-Host ""
Write-Host "3. Update frontend .env:" -ForegroundColor Cyan
Write-Host "   REACT_APP_BACKEND_URL=$FUNCTION_APP_URL/api"
Write-Host ""
