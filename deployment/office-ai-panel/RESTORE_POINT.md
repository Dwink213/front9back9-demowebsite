# Office AI Panel - Restore Point Documentation

**Date Created:** October 16, 2025
**Project Status:** Code Complete, Infrastructure Ready for Deployment
**Purpose:** Comprehensive record of implementation decisions, architecture, and deployment state

---

## Executive Summary

The Office AI Panel is an interactive web application where users select 3 characters from "The Office" TV show and ask questions. The selected characters engage in a two-round AI-powered debate:
- **Round 1:** Each character gives their immediate reaction (sequential, with context)
- **Round 2:** Characters build consensus after hearing all perspectives

**Technology Stack:**
- Frontend: React (hosted on Azure Static Web Apps)
- Backend: Azure Functions (Python 3.11)
- AI: OpenAI GPT-4o-mini
- Infrastructure: Bicep (Infrastructure-as-Code)

---

## Project History and Evolution

### Initial Discovery
Located existing Office AI Panel project in `Office-AI-Panel/AI-Office-panel-emergent/` directory:
- **Original Architecture:** FastAPI backend (Python) + React frontend
- **Original Hosting:** Designed for traditional server deployment
- **Security Issue:** OpenAI API key exposed in `backend/.env` file
- **Status:** Never deployed, development code only

### Architectural Decision: Why External Function App?

**Azure Static Web Apps Limitation:**
Azure Static Web Apps supports Azure Functions, BUT only through a single `/api` folder at the root level. This presents a problem for multi-project portfolios:

**Options Evaluated:**

1. **Root-Level API Folder (Rejected)**
   - ❌ Only allows ONE API for entire portfolio
   - ❌ Can't have separate APIs for different projects
   - ❌ Bicep Builder might need its own API in the future

2. **External Function App (CHOSEN)**
   - ✅ Dedicated infrastructure for Office AI Panel
   - ✅ Independent scaling and monitoring
   - ✅ Separate cost tracking
   - ✅ Doesn't interfere with future projects
   - ✅ Production-grade architecture

3. **Demo Mode Only (Rejected)**
   - ❌ Defeats the purpose of the interactive experience
   - ❌ Can't demonstrate real AI capabilities

**Decision:** Deploy Office AI Panel backend as a separate Azure Function App with its own resource group, enabling proper separation of concerns and future scalability.

---

## What Was Built

### 1. React Frontend (`projects/office-ai-panel/`)

**Source:** Built from `Office-AI-Panel/AI-Office-panel-emergent/frontend/`

**Key Changes Made:**
- ✅ Updated API endpoint from `localhost:8000` to environment variable
- ✅ Added `"homepage": "."` to package.json for relative paths
- ✅ Switched from BrowserRouter to HashRouter (works in subdirectories)
- ✅ Built production bundle with `npm run build`
- ✅ Copied to `projects/office-ai-panel/`

**Configuration:**
```javascript
// App.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
```

**Character Selection:**
12 Office characters available: Michael, Jim, Pam, Dwight, Angela, Kevin, Stanley, Oscar, Phyllis, Andy, Toby, Creed

**UI Flow:**
1. User selects 3 characters
2. User enters question
3. Round 1 responses appear sequentially (2nd → 1st → 3rd character order)
4. Round 2 consensus responses appear sequentially (same order)

### 2. Azure Functions Backend (`projects/office-ai-panel/api/`)

**Functions Created:**

#### `/api/chat` (Main Logic)
- **Method:** POST
- **Input:** `{ question: string, selected_characters: [char_id1, char_id2, char_id3] }`
- **Output:** `{ question: string, round1_responses: [...], round2_responses: [...] }`
- **AI Model:** GPT-4o-mini
- **Response Time:** ~2-4 seconds per character (6-12 seconds total)

**Two-Round Debate Logic:**
```
Round 1: Immediate Reactions
- Character 2 responds first (no context)
- Character 1 responds (sees Character 2's response)
- Character 3 responds (sees Character 1 & 2's responses)

Round 2: Consensus Building
- Character 2 responds (sees all Round 1 responses)
- Character 1 responds (sees all Round 1 + Character 2's Round 2)
- Character 3 responds (sees all previous responses)
```

**Character Personality Prompts:**
Each character has a unique system prompt that captures their personality:
- Jim: Sarcastic salesman with pranks and camera glances
- Dwight: Intense Assistant Regional Manager
- Michael: Desperate-to-be-liked boss
- Etc.

#### `/api/characters` (Character List)
- **Method:** GET
- **Output:** Array of all 12 characters with names and IDs

**File Structure:**
```
projects/office-ai-panel/api/
├── chat/
│   ├── __init__.py          # Main chat logic
│   └── function.json         # HTTP trigger config
├── characters/
│   ├── __init__.py          # Character list endpoint
│   └── function.json
├── host.json                # Function App config
└── requirements.txt         # Python dependencies
```

**Dependencies:**
- `azure-functions`
- `openai>=1.0.0`

### 3. Infrastructure as Code (`deployment/office-ai-panel/`)

#### `main.bicep` - Azure Resources
Defines 4 Azure resources:

1. **Storage Account** (`officceaipanelprodsa`)
   - Standard_LRS (locally redundant)
   - Required for Function App runtime

2. **App Service Plan** (`office-ai-panel-prod-plan`)
   - Consumption Plan (Y1 tier)
   - Dynamic scaling
   - Linux reserved
   - Pay-per-execution pricing

3. **Application Insights** (`office-ai-panel-prod-ai`)
   - Monitoring and logging
   - 5GB free tier per month

4. **Function App** (`office-ai-panel-prod-func`)
   - Python 3.11 runtime
   - Linux-based
   - HTTPS-only
   - CORS configured for Static Web Apps origin
   - Environment variables:
     - `OPENAI_API_KEY` (from parameters)
     - `CORS_ORIGINS` (from parameters)
     - Azure Functions runtime settings

**Outputs:**
- `functionAppName`: Name of deployed Function App
- `functionAppUrl`: HTTPS URL for API calls
- `functionAppId`: Azure resource ID

#### `parameters.json` - Configuration
**IMPORTANT:** Contains placeholder values that MUST be updated before deployment:

```json
{
  "openAiApiKey": {
    "value": "YOUR_OPENAI_API_KEY_HERE"  // ⚠️ UPDATE THIS
  },
  "corsOrigins": {
    "value": "https://lemon-pebble-067db5b0f.2.azurestaticapps.net"
  }
}
```

**Security Note:**
- Original project had API key exposed in `backend/.env`
- This key should be considered compromised
- **Generate a fresh OpenAI API key** before deployment: https://platform.openai.com/api-keys
- Never commit `parameters.json` with real API key to Git

#### `deploy.ps1` and `deploy.sh` - Deployment Scripts
Automated scripts that:
1. Verify Azure CLI login
2. Display current subscription
3. Request user confirmation
4. Create resource group (`rg-office-ai-panel-prod`)
5. Validate Bicep template
6. Deploy infrastructure
7. Extract and display outputs
8. Show next steps for code deployment

**Resource Group:** `rg-office-ai-panel-prod`
**Location:** `eastus2`

---

## Current Deployment State

### ✅ Completed
- [x] React frontend built and deployed to `projects/office-ai-panel/`
- [x] Azure Functions code created in `projects/office-ai-panel/api/`
- [x] Bicep infrastructure templates created
- [x] Deployment scripts (PowerShell and Bash) created
- [x] Comprehensive deployment instructions written
- [x] Added to portfolio index.html
- [x] Committed frontend to GitHub

### ⏳ Not Yet Deployed
- [ ] Azure Function App infrastructure (requires running deployment script)
- [ ] Python function code to Azure (requires `func azure functionapp publish`)
- [ ] Frontend environment variable update with actual Function App URL

### 🔧 Manual Steps Required

**Step 1: Update OpenAI API Key**
1. Go to https://platform.openai.com/api-keys
2. Create new API key (old one in `backend/.env` is exposed)
3. Update `deployment/office-ai-panel/parameters.json`
4. **Never commit this file with real key**

**Step 2: Deploy Infrastructure**
```powershell
# Windows
cd deployment/office-ai-panel
.\deploy.ps1

# Linux/Mac
cd deployment/office-ai-panel
chmod +x deploy.sh
./deploy.sh
```

**Step 3: Deploy Function Code**
```bash
cd ../../projects/office-ai-panel/api
pip install -r requirements.txt
func azure functionapp publish office-ai-panel-prod-func --python
```

**Step 4: Update Frontend Environment Variable**
Create `.env` in `Office-AI-Panel/AI-Office-panel-emergent/frontend/`:
```
REACT_APP_BACKEND_URL=https://office-ai-panel-prod-func.azurewebsites.net/api
```

Then rebuild:
```bash
cd Office-AI-Panel/AI-Office-panel-emergent/frontend
npm run build
cp -r build/* ../../../projects/office-ai-panel/
```

**Step 5: Commit and Push**
```bash
git add projects/office-ai-panel/
git commit -m "Update Office AI Panel with production API URL"
git push
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Azure Static Web Apps                                       │
│  (lemon-pebble-067db5b0f.2.azurestaticapps.net)            │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │   index.html    │  │  Bicep Builder   │                 │
│  │  (Portfolio)    │  │   (Project 1)    │                 │
│  └─────────────────┘  └──────────────────┘                 │
│                                                               │
│  ┌───────────────────────────────────────┐                  │
│  │  Office AI Panel Frontend (Project 2) │                  │
│  │  - Character selection                 │                  │
│  │  - Question input                      │                  │
│  │  - Response display                    │                  │
│  └───────────────────────────────────────┘                  │
│                       │                                       │
└───────────────────────┼───────────────────────────────────┘
                        │ HTTPS + CORS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  External Azure Function App                                 │
│  (office-ai-panel-prod-func.azurewebsites.net)              │
│  Resource Group: rg-office-ai-panel-prod                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────────┐                    │
│  │ /api/chat    │  │ /api/characters  │                    │
│  │ (Python 3.11)│  │  (Python 3.11)   │                    │
│  └──────────────┘  └──────────────────┘                    │
│         │                                                     │
│         ├─────────────────┐                                  │
│  ┌──────▼─────┐  ┌────────▼────────┐                       │
│  │  App       │  │  Application    │                        │
│  │  Insights  │  │  Insights       │                        │
│  └────────────┘  └─────────────────┘                       │
│         │                                                     │
│         │ API Key (Environment Variable)                     │
│         ▼                                                     │
│  [OPENAI_API_KEY]                                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  OpenAI API      │
              │  GPT-4o-mini     │
              └──────────────────┘
```

---

## Cost Estimation

### Monthly Costs (Typical Usage)

| Resource | Tier | Monthly Cost |
|----------|------|--------------|
| Azure Static Web Apps | Free | $0.00 |
| Function App | Consumption | $0.00 (1M free executions) |
| Storage Account | Standard LRS | ~$0.02/GB |
| Application Insights | Free tier | $0.00 (5GB free) |
| **Total Azure** | | **$2-5/month** |
| OpenAI GPT-4o-mini | | $0.30 per 1,000 questions |

**Example Scenarios:**
- **Low Usage** (100 questions/month): $0.03 OpenAI + $2 Azure = **$2.03/month**
- **Medium Usage** (1,000 questions/month): $0.30 OpenAI + $3 Azure = **$3.30/month**
- **High Usage** (10,000 questions/month): $3.00 OpenAI + $5 Azure = **$8/month**

**Cold Start:** First request after 10+ minutes of inactivity may take 10-15 seconds (Function App warm-up). Subsequent requests are fast.

---

## File Inventory

### Production Files (Committed to Git)

```
projects/office-ai-panel/               # Frontend (built React app)
├── index.html
├── static/
│   ├── js/
│   ├── css/
│   └── media/
└── api/                                # Backend (Azure Functions)
    ├── chat/
    │   ├── __init__.py                # 2-round debate logic
    │   └── function.json
    ├── characters/
    │   ├── __init__.py                # Character list
    │   └── function.json
    ├── host.json
    └── requirements.txt

deployment/office-ai-panel/             # Infrastructure
├── main.bicep                          # Azure resources
├── parameters.json                     # Configuration (⚠️ contains API key)
├── deploy.ps1                          # Windows deployment
├── deploy.sh                           # Linux/Mac deployment
├── DEPLOYMENT_INSTRUCTIONS.md          # Step-by-step guide
└── RESTORE_POINT.md                    # This file

index.html                              # Portfolio home page
└── [Links to Office AI Panel]
```

### Development Files (Ignored by Git)

```
Office-AI-Panel/                        # Original development code
├── AI-Office-panel-emergent/
│   ├── frontend/                       # React source (built to projects/)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── backend/
│       ├── main.py                     # Original FastAPI backend
│       ├── .env                        # ⚠️ EXPOSED API KEY - DO NOT USE
│       └── requirements.txt
```

**Git Ignore Rule:** `/Office-AI-Panel/` (excludes root directory only, not projects/office-ai-panel)

---

## Integration with Portfolio

### Portfolio Structure

```
https://lemon-pebble-067db5b0f.2.azurestaticapps.net/
│
├── /                                   # Portfolio home page
│   └── index.html                      # Lists all 3 projects
│
├── /projects/front9back9/              # Project 1
│   └── index.html                      # Algorithm demo
│
├── /projects/bicep-builder/            # Project 2
│   └── index.html                      # VM Bicep generator wizard
│
└── /projects/office-ai-panel/          # Project 3
    └── index.html                      # Office AI Panel (THIS PROJECT)
```

### Portfolio Card (in root index.html)

```html
<a href="projects/office-ai-panel/index.html" class="project-card">
    <h2>Office AI Panel</h2>
    <p class="tagline">Get advice from The Office characters powered by AI</p>
    <p>Interactive web app where you select 3 characters from The Office
       TV show and ask them questions. The selected characters engage in
       a two-round debate: first giving immediate reactions, then building
       consensus after hearing all perspectives. Powered by OpenAI GPT-4o-mini
       with unique personality prompts for each character.</p>
    <div class="tech-stack">
        <span class="tech-badge">Azure Functions</span>
        <span class="tech-badge">React</span>
        <span class="tech-badge">OpenAI</span>
        <span class="tech-badge">Python</span>
    </div>
</a>
```

---

## Related Projects Context

### Bicep Builder
**Location:** `projects/bicep-builder/`
**Purpose:** Interactive wizard to generate Azure Bicep templates for VM deployment
**Key Features:**
- 4-page wizard (Intro → Discovery → VM Config → Network)
- Front9/Back9 algorithm for resource naming
- Generates downloadable Bicep file
- Uses HashRouter for subdirectory hosting

**Shared Learnings:**
- Both projects use `"homepage": "."` for subdirectory support
- Both switched from BrowserRouter to HashRouter
- Both added to portfolio index.html with tech badges

### Front9/Back9 Algorithm
**Location:** `projects/front9back9/`
**Purpose:** Demonstrate naming convention for Azure resources
**Logic:**
- Clean subscription name (remove special chars)
- If ≤18 characters: use full name
- If >18 characters: use First 9 + Last 9 characters
- Apply to: Resource Groups, VNets, Subnets

**Example:** "North Carolina State University Information Technology"
→ Cleaned: "NorthCarolinaStateUniversityInformationTechnology" (51 chars)
→ Identity: "NorthCarohnology" (front 9 + back 9)

---

## Troubleshooting Guide

### Issue: "CORS Error in Browser"
**Symptoms:** Console shows "Access-Control-Allow-Origin" error
**Cause:** Frontend origin not in CORS allowed list
**Fix:**
1. Update `deployment/office-ai-panel/parameters.json`:
   ```json
   "corsOrigins": {
     "value": "https://lemon-pebble-067db5b0f.2.azurestaticapps.net,http://localhost:3000"
   }
   ```
2. Redeploy infrastructure: `./deploy.ps1` or `./deploy.sh`

### Issue: "502 Bad Gateway"
**Symptoms:** API returns 502 error
**Cause:** Function App cold start (first request after inactivity)
**Fix:** Wait 10-15 seconds and retry. Subsequent requests will be fast.

### Issue: "Invalid API Key"
**Symptoms:** OpenAI API errors in Application Insights logs
**Cause:** Incorrect or expired API key
**Fix:** Update key in Azure:
```bash
az functionapp config appsettings set \
  --name office-ai-panel-prod-func \
  --resource-group rg-office-ai-panel-prod \
  --settings "OPENAI_API_KEY=sk-your-new-key"
```

### Issue: "Function Not Found"
**Symptoms:** 404 errors for `/api/chat` or `/api/characters`
**Cause:** Function code not deployed
**Fix:**
```bash
cd projects/office-ai-panel/api
func azure functionapp publish office-ai-panel-prod-func --python
```

### Issue: "Blank Page in Browser"
**Symptoms:** React app shows blank white page
**Cause:** Frontend trying to call wrong backend URL
**Fix:**
1. Check browser console for network errors
2. Verify `REACT_APP_BACKEND_URL` environment variable
3. Rebuild frontend with correct URL
4. Clear browser cache

---

## Monitoring and Maintenance

### View Logs
```bash
# Stream live Function App logs
func azure functionapp logstream office-ai-panel-prod-func

# View in Azure Portal
az portal open --resource-group rg-office-ai-panel-prod
# Navigate to Function App → Monitor → Logs
```

### Check Metrics
```bash
# View Application Insights metrics
az monitor app-insights component show \
  --app office-ai-panel-prod-ai \
  --resource-group rg-office-ai-panel-prod
```

**Key Metrics to Monitor:**
- Execution count (requests per day)
- Response time (should be 2-4 sec/character)
- Error rate (should be <1%)
- OpenAI API costs (track in OpenAI dashboard)

### Set Up Cost Alerts
```bash
# Create budget alert for resource group
az consumption budget create \
  --budget-name office-ai-panel-budget \
  --resource-group rg-office-ai-panel-prod \
  --amount 20 \
  --time-grain Monthly \
  --start-date $(date -u +"%Y-%m-01T00:00:00Z")
```

---

## Security Considerations

### ✅ Implemented
- HTTPS-only Function App (enforced in Bicep)
- CORS restricted to specific origin (Static Web Apps URL)
- TLS 1.2 minimum (enforced in Bicep)
- FTPS disabled (enforced in Bicep)
- API key stored as environment variable (not in code)

### ⚠️ Recommendations
- **API Key Rotation:** Generate fresh OpenAI key before deployment
- **Rate Limiting:** Consider implementing Azure Table Storage for rate limits
- **Authentication:** Current version is public; consider adding user auth for production
- **Input Validation:** Add character limit to questions (currently unlimited)
- **Cost Controls:** Set Azure budget alerts to prevent unexpected charges

### 🔴 Known Issues
- Original `backend/.env` file contains exposed OpenAI API key
- This key should be considered compromised
- Never use the original key for production deployment

---

## Future Enhancements (Not Implemented)

### Rate Limiting
**Problem:** No protection against API abuse
**Solution:** Implement Azure Table Storage to track requests per IP:
```python
# In chat/__init__.py
from azure.data.tables import TableServiceClient

def check_rate_limit(ip_address):
    # Track requests per IP per hour
    # Return 429 Too Many Requests if exceeded
```

### User Authentication
**Problem:** Anyone can use the app and incur costs
**Solution:** Add Azure AD B2C or custom auth:
- Require sign-in to access chat
- Track usage per user
- Set per-user quotas

### Character Profiles
**Problem:** Users don't know character personalities
**Solution:** Add character bios and personality descriptions before selection

### Response Caching
**Problem:** Same question asked multiple times calls OpenAI API each time
**Solution:** Cache responses in Azure Table Storage:
- Key: Hash of (question + selected_characters)
- Value: Cached responses
- TTL: 24 hours

### Streaming Responses
**Problem:** Users wait 6-12 seconds with no feedback
**Solution:** Use OpenAI streaming API to show responses as they're generated

---

## Rollback Procedures

### If Deployment Fails

**Option 1: Delete Resource Group**
```bash
az group delete --name rg-office-ai-panel-prod --yes --no-wait
```

**Option 2: Roll Back Frontend**
```bash
# Revert to previous commit
git revert HEAD
git push

# Azure Static Web Apps will auto-redeploy previous version
```

### If Need to Remove from Portfolio

1. Remove card from `index.html`
2. Delete `projects/office-ai-panel/` directory
3. Delete `deployment/office-ai-panel/` directory
4. Commit and push
5. Delete Azure resources if deployed

---

## Support and Documentation

### Primary Documentation
- **Deployment Instructions:** `deployment/office-ai-panel/DEPLOYMENT_INSTRUCTIONS.md`
- **This Document:** `deployment/office-ai-panel/RESTORE_POINT.md`
- **Azure Functions Docs:** https://learn.microsoft.com/en-us/azure/azure-functions/
- **OpenAI API Docs:** https://platform.openai.com/docs/

### Useful Commands

```bash
# Check Azure login
az account show

# List all resources in group
az resource list --resource-group rg-office-ai-panel-prod --output table

# Check Function App status
az functionapp show \
  --name office-ai-panel-prod-func \
  --resource-group rg-office-ai-panel-prod \
  --query state

# View recent deployments
az deployment group list \
  --resource-group rg-office-ai-panel-prod \
  --output table

# Delete everything (⚠️ DESTRUCTIVE)
az group delete --name rg-office-ai-panel-prod --yes --no-wait
```

---

## Summary

The Office AI Panel has been successfully refactored from a traditional FastAPI + React application into a modern serverless architecture suitable for Azure Static Web Apps. All code is complete and ready for deployment. The external Azure Function App approach was chosen to maintain project separation and scalability within the portfolio.

**To deploy, follow:** `deployment/office-ai-panel/DEPLOYMENT_INSTRUCTIONS.md`

**Current blockers:**
1. Need fresh OpenAI API key (old one exposed in `.env`)
2. Manual deployment steps required (scripts are ready)

**Estimated time to deploy:** 15-20 minutes (including Azure resource provisioning)

**Post-deployment tasks:**
1. Update frontend with production Function App URL
2. Rebuild and commit frontend
3. Test live site end-to-end
4. Set up cost monitoring alerts

---

**End of Restore Point Documentation**
