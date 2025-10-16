# Office AI Panel - Deployment Instructions

## Overview
This document provides step-by-step instructions to deploy the Office AI Panel backend as a separate Azure Function App.

---

## Prerequisites

### 1. Install Azure CLI
```bash
# Windows (PowerShell)
winget install Microsoft.AzureCLI

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 2. Install Azure Functions Core Tools
```bash
# Windows (PowerShell)
winget install Microsoft.Azure.FunctionsCoreTools

# macOS
brew tap azure/functions
brew install azure-functions-core-tools@4

# Linux
wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install azure-functions-core-tools-4
```

### 3. Install Python 3.11
```bash
# Windows
winget install Python.Python.3.11

# macOS
brew install python@3.11

# Linux
sudo apt-get install python3.11
```

### 4. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

---

## Deployment Steps

### Step 1: Login to Azure
```bash
az login
```

Select your subscription:
```bash
az account list --output table
az account set --subscription "Your Subscription Name"
```

### Step 2: Update Parameters File
Edit `deployment/office-ai-panel/parameters.json`:

```json
{
  "openAiApiKey": {
    "value": "sk-your-actual-api-key-here"
  },
  "corsOrigins": {
    "value": "https://lemon-pebble-067db5b0f.2.azurestaticapps.net"
  }
}
```

**IMPORTANT:** Never commit the parameters file with your actual API key to Git!

### Step 3: Deploy Infrastructure

**Option A: Using PowerShell (Windows)**
```powershell
cd deployment/office-ai-panel
.\deploy.ps1
```

**Option B: Using Bash (Linux/macOS)**
```bash
cd deployment/office-ai-panel
chmod +x deploy.sh
./deploy.sh
```

**Option C: Manual Azure CLI**
```bash
cd deployment/office-ai-panel

# Create Resource Group
az group create --name rg-office-ai-panel-prod --location eastus2

# Deploy Bicep template
az deployment group create \
  --resource-group rg-office-ai-panel-prod \
  --template-file main.bicep \
  --parameters parameters.json
```

### Step 4: Deploy Function Code

After infrastructure deployment completes, deploy the Python code:

```bash
# Navigate to API folder
cd ../../projects/office-ai-panel/api

# Install dependencies locally (required for deployment)
pip install -r requirements.txt

# Deploy to Azure (replace with your function app name from Step 3 output)
func azure functionapp publish office-ai-panel-prod-func --python
```

**Expected Output:**
```
Getting site publishing info...
Creating archive for current directory...
Uploading 2.45 MB [###############################################################################]
Upload completed successfully.
Deployment completed successfully.
Syncing triggers...
Functions in office-ai-panel-prod-func:
    chat - [httpTrigger]
        Invoke url: https://office-ai-panel-prod-func.azurewebsites.net/api/chat

    characters - [httpTrigger]
        Invoke url: https://office-ai-panel-prod-func.azurewebsites.net/api/characters
```

### Step 5: Test Endpoints

Test the deployed functions:

```bash
# Test characters endpoint
curl https://office-ai-panel-prod-func.azurewebsites.net/api/characters

# Test chat endpoint (POST)
curl -X POST https://office-ai-panel-prod-func.azurewebsites.net/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I reply-all?",
    "selected_characters": ["jim", "dwight", "pam"]
  }'
```

### Step 6: Update Frontend Configuration

You have two options:

**Option A: Environment Variable (Recommended)**
Create `.env` file in `Office-AI-Panel/AI-Office-panel-emergent/frontend/`:
```
REACT_APP_BACKEND_URL=https://office-ai-panel-prod-func.azurewebsites.net/api
```

Then rebuild frontend:
```bash
cd Office-AI-Panel/AI-Office-panel-emergent/frontend
npm run build
cp -r build/* ../../../projects/office-ai-panel/
```

**Option B: Hardcode URL (Quick Test)**
Edit `Office-AI-Panel/AI-Office-panel-emergent/frontend/src/App.js`:
```javascript
const BACKEND_URL = 'https://office-ai-panel-prod-func.azurewebsites.net/api';
```

Then rebuild and copy as above.

### Step 7: Commit and Deploy

```bash
git add projects/office-ai-panel/
git commit -m "Update Office AI Panel frontend with deployed backend URL"
git push
```

Wait 2-3 minutes for Azure Static Web Apps to redeploy.

---

## Verification

1. **Check Azure Resources**
   ```bash
   az resource list --resource-group rg-office-ai-panel-prod --output table
   ```

2. **Check Function App Status**
   ```bash
   az functionapp show \
     --name office-ai-panel-prod-func \
     --resource-group rg-office-ai-panel-prod \
     --query state
   ```

3. **Test Live Site**
   Navigate to: https://lemon-pebble-067db5b0f.2.azurestaticapps.net/projects/office-ai-panel/

   - Select 3 characters
   - Ask a question
   - Verify responses appear

---

## Cost Estimation

### Monthly Costs (Approximate)

| Resource | Tier | Cost |
|----------|------|------|
| Function App | Consumption | $0.00 (first 1M executions free) |
| Storage Account | Standard LRS | ~$0.02/GB/month |
| Application Insights | Pay-as-you-go | ~$0.00 (5GB free/month) |
| **Total Azure** | | **~$2-5/month** |
| OpenAI API (GPT-4o-mini) | | ~$0.30 per 1,000 questions |

**Example Usage:**
- 10,000 questions/month = $3.00 OpenAI + $3 Azure = **$6/month**
- 100,000 questions/month = $30 OpenAI + $5 Azure = **$35/month**

---

## Troubleshooting

### Issue: "Deployment failed - unauthorized"
**Solution:** Ensure you're logged into Azure with correct subscription
```bash
az login
az account show
```

### Issue: "Function app not found"
**Solution:** Check resource group and function app name
```bash
az functionapp list --resource-group rg-office-ai-panel-prod --output table
```

### Issue: "CORS error in browser"
**Solution:** Update CORS origins in parameters.json and redeploy
```json
{
  "corsOrigins": {
    "value": "https://lemon-pebble-067db5b0f.2.azurestaticapps.net,http://localhost:3000"
  }
}
```

### Issue: "OpenAI API error - invalid key"
**Solution:** Update OpenAI API key in Azure
```bash
az functionapp config appsettings set \
  --name office-ai-panel-prod-func \
  --resource-group rg-office-ai-panel-prod \
  --settings "OPENAI_API_KEY=sk-your-new-key"
```

### Issue: "502 Bad Gateway"
**Solution:** Function app may be cold starting (wait 10-15 seconds and retry)

### Issue: "Response too slow"
**Solution:** This is expected on first request (cold start). Subsequent requests will be faster.

---

## Monitoring

### View Logs
```bash
# Stream live logs
func azure functionapp logstream office-ai-panel-prod-func

# View Application Insights
az monitor app-insights component show \
  --app office-ai-panel-prod-ai \
  --resource-group rg-office-ai-panel-prod
```

### View Metrics in Azure Portal
1. Go to Azure Portal
2. Navigate to Function App: `office-ai-panel-prod-func`
3. Click "Monitor" → "Metrics"
4. View:
   - Execution count
   - Response time
   - Error rate

---

## Cleanup (Optional)

To remove all resources and stop costs:

```bash
# Delete entire resource group (WARNING: Deletes everything!)
az group delete --name rg-office-ai-panel-prod --yes --no-wait
```

---

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review Azure Function App logs
3. Verify OpenAI API key is valid
4. Check CORS configuration

---

## Next Steps

After successful deployment:
1. ✅ Test all 12 characters
2. ✅ Monitor costs in Azure Portal
3. ✅ Set up alerts for high usage
4. ✅ Consider implementing rate limiting with Azure Table Storage
5. ✅ Add custom domain (optional)
