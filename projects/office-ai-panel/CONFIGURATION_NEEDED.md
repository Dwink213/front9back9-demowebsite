# Configuration Required

## Current Status
This is a built version of the Office AI Panel React frontend, but it is **not yet configured** with the production Azure Function App URL.

## What This Means
The frontend is currently configured to call `/api` (relative path), which will not work because:
- Azure Static Web Apps does not have an `/api` folder at the root
- The backend is deployed as a separate Azure Function App

## Steps to Complete Configuration

### 1. Deploy the Backend Infrastructure
Follow instructions in `../../deployment/office-ai-panel/DEPLOYMENT_INSTRUCTIONS.md`:

```bash
cd deployment/office-ai-panel
./deploy.ps1  # Windows
# or
./deploy.sh   # Linux/Mac
```

**Note the Function App URL from the output** (e.g., `https://office-ai-panel-prod-func.azurewebsites.net`)

### 2. Deploy the Function Code

```bash
cd ../../projects/office-ai-panel/api
pip install -r requirements.txt
func azure functionapp publish office-ai-panel-prod-func --python
```

### 3. Update Frontend Configuration

Create `.env` file in `Office-AI-Panel/AI-Office-panel-emergent/frontend/`:

```env
REACT_APP_BACKEND_URL=https://office-ai-panel-prod-func.azurewebsites.net/api
```

*(Replace with your actual Function App URL from Step 1)*

### 4. Rebuild and Deploy Frontend

```bash
cd Office-AI-Panel/AI-Office-panel-emergent/frontend
npm run build
cp -r build/* ../../../projects/office-ai-panel/
```

### 5. Commit and Push

```bash
git add projects/office-ai-panel/
git commit -m "Update Office AI Panel with production API URL"
git push
```

Wait 2-3 minutes for Azure Static Web Apps to redeploy.

### 6. Test

Navigate to: https://lemon-pebble-067db5b0f.2.azurestaticapps.net/projects/office-ai-panel/

- Select 3 characters
- Ask a question
- Verify responses appear

## Quick Check: Is It Configured?

Open browser developer console and check the network requests:
- **Not Configured:** Requests go to `/api/chat` (same domain - will fail)
- **Configured:** Requests go to `https://office-ai-panel-prod-func.azurewebsites.net/api/chat`

---

For full deployment instructions, see: `../../deployment/office-ai-panel/DEPLOYMENT_INSTRUCTIONS.md`
