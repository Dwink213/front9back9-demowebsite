#!/bin/bash
# Office AI Panel - Deployment Script
# Deploys Azure Function App infrastructure and code

set -e  # Exit on error

# Configuration
RESOURCE_GROUP="rg-office-ai-panel-prod"
LOCATION="eastus2"
BICEP_FILE="main.bicep"
PARAMETERS_FILE="parameters.json"

echo "=========================================="
echo "Office AI Panel - Azure Deployment"
echo "=========================================="
echo ""

# Check if logged in to Azure
echo "Checking Azure login..."
if ! az account show &> /dev/null; then
    echo "Error: Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "✓ Azure login verified"
echo ""

# Display current subscription
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo "Current subscription: $SUBSCRIPTION_NAME"
echo ""

read -p "Continue with this subscription? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Create Resource Group
echo ""
echo "Step 1: Creating Resource Group..."
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "✓ Resource Group '$RESOURCE_GROUP' already exists"
else
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo "✓ Resource Group '$RESOURCE_GROUP' created"
fi

# Validate Bicep template
echo ""
echo "Step 2: Validating Bicep template..."
az deployment group validate \
    --resource-group $RESOURCE_GROUP \
    --template-file $BICEP_FILE \
    --parameters $PARAMETERS_FILE

echo "✓ Bicep template validation passed"

# Deploy infrastructure
echo ""
echo "Step 3: Deploying infrastructure..."
echo "This will create:"
echo "  - Storage Account"
echo "  - App Service Plan (Consumption)"
echo "  - Application Insights"
echo "  - Function App"
echo ""

DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file $BICEP_FILE \
    --parameters $PARAMETERS_FILE \
    --query properties.outputs \
    -o json)

echo "✓ Infrastructure deployed successfully"

# Extract outputs
FUNCTION_APP_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.functionAppName.value')
FUNCTION_APP_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.functionAppUrl.value')

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Function App Name: $FUNCTION_APP_NAME"
echo "Function App URL:  $FUNCTION_APP_URL"
echo ""
echo "Next Steps:"
echo "1. Deploy function code:"
echo "   cd ../../projects/office-ai-panel/api"
echo "   func azure functionapp publish $FUNCTION_APP_NAME"
echo ""
echo "2. Test endpoints:"
echo "   curl $FUNCTION_APP_URL/api/characters"
echo ""
echo "3. Update frontend .env:"
echo "   REACT_APP_BACKEND_URL=$FUNCTION_APP_URL/api"
echo ""
