# Office AI Panel - Azure Static Web Apps Structure

## Project Structure
```
projects/office-ai-panel/
├── index.html                    # React build output
├── static/
│   ├── css/
│   └── js/
└── api/                          # Azure Functions (Python)
    ├── chat/
    │   ├── __init__.py          # Main chat endpoint
    │   └── function.json
    ├── characters/
    │   ├── __init__.py          # Get character list
    │   └── function.json
    ├── host.json
    └── requirements.txt          # Python dependencies
```

## API Function: chat/__init__.py
```python
import azure.functions as func
import json
import os
from openai import OpenAI

# Get OpenAI API key from Azure environment (secure)
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# Character personas (same as original)
OFFICE_CHARACTERS = {
    "jim": {
        "name": "Jim Halpert",
        "emoji": "👔",
        "system_prompt": "You are Jim Halpert from The Office. Sarcastic, dry humor..."
    },
    # ... other characters
}

async def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Handle chat requests
    POST /api/chat
    Body: { "question": "...", "selected_characters": ["jim", "dwight", "pam"] }
    """
    try:
        req_body = req.get_json()
        question = req_body.get('question')
        selected_characters = req_body.get('selected_characters')

        # Validate
        if not question or len(selected_characters) != 3:
            return func.HttpResponse(
                json.dumps({"error": "Invalid request"}),
                status_code=400,
                mimetype="application/json"
            )

        # Generate responses (sequential for simplicity)
        responses = []
        for char_id in selected_characters:
            character = OFFICE_CHARACTERS[char_id]

            # Call OpenAI
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": character["system_prompt"]},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=500
            )

            responses.append({
                "character": char_id,
                "response": completion.choices[0].message.content,
                "character_info": character
            })

        return func.HttpResponse(
            json.dumps({"responses": responses}),
            mimetype="application/json"
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
```

## API Function: characters/__init__.py
```python
import azure.functions as func
import json

OFFICE_CHARACTERS = {
    "jim": {"name": "Jim Halpert", "emoji": "👔", "descriptor": "Sarcastic Realist"},
    "dwight": {"name": "Dwight Schrute", "emoji": "👓", "descriptor": "Intense By-the-book"},
    "pam": {"name": "Pam Beesly", "emoji": "🎨", "descriptor": "Diplomatic Peacemaker"},
    "stanley": {"name": "Stanley Hudson", "emoji": "😐", "descriptor": "No-nonsense Minimal"},
    "oscar": {"name": "Oscar Martinez", "emoji": "📊", "descriptor": "Fact-checker"},
    "angela": {"name": "Angela Martin", "emoji": "😾", "descriptor": "Judgmental Critic"},
    "erin": {"name": "Erin Hannon", "emoji": "☀️", "descriptor": "Enthusiastic Confused"},
    "phyllis": {"name": "Phyllis Vance", "emoji": "🌸", "descriptor": "Passive-aggressive Wisdom"},
    "creed": {"name": "Creed Bratton", "emoji": "🎸", "descriptor": "Cryptic Wildcard"},
    "kelly": {"name": "Kelly Kapoor", "emoji": "💅", "descriptor": "Dramatic Pop Culture"},
    "kevin": {"name": "Kevin Malone", "emoji": "🍪", "descriptor": "Simple but Insightful"},
    "michael": {"name": "Michael Scott", "emoji": "👔", "descriptor": "Overconfident Chaos"}
}

async def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Get all characters
    GET /api/characters
    """
    return func.HttpResponse(
        json.dumps({"characters": OFFICE_CHARACTERS}),
        mimetype="application/json"
    )
```

## requirements.txt
```
azure-functions
openai
```

## function.json (for chat endpoint)
```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "chat"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

## host.json
```json
{
  "version": "2.0",
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  }
}
```

## Frontend Changes (React)
```javascript
// Old: Call to localhost backend
const response = await fetch('http://localhost:8001/api/chat', {...})

// New: Call to Azure Functions (same domain)
const response = await fetch('/api/chat', {...})
```

## Azure Configuration (Environment Variables)
Set in Azure Portal → Static Web App → Configuration:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

## Key Differences from Original

### Simplified (No Streaming)
- Original: Streaming word-by-word with Server-Sent Events
- Azure: All responses at once (simpler, still fast)

### No MongoDB
- Original: Stores conversation history
- Azure: Could add Azure Table Storage later if needed

### Rate Limiting
- Original: In-memory dictionary
- Azure: Would use Azure Table Storage or Redis Cache

### Sequential vs Parallel
- Original: 3 simultaneous OpenAI calls
- Azure: Sequential calls (simpler, still completes in ~45 seconds)

## Deployment Workflow
GitHub workflow automatically handles:
1. Build React app → `projects/office-ai-panel/`
2. Deploy Azure Functions from `projects/office-ai-panel/api/`
3. Both live at same URL (e.g., `yoursite.com/projects/office-ai-panel`)

## Estimated Costs
- **Azure Static Web Apps:** Free tier includes 100GB bandwidth/month
- **Azure Functions:** First 1M requests free/month
- **OpenAI API:** ~$0.0001 per response (GPT-4o-mini)
  - 1,000 questions = ~$0.30
  - 10,000 questions = ~$3.00

## Trade-offs

### What We Keep
✅ Character personalities (all 12)
✅ Two-round debate format
✅ Multiple character selection
✅ AI-powered responses
✅ Same user experience

### What We Simplify
⚠️ No streaming (responses appear all at once, not word-by-word)
⚠️ No conversation history storage
⚠️ Sequential instead of parallel API calls (slightly slower)

### What We Gain
✅ Serverless (pay per use, not always-on server)
✅ Integrated deployment (frontend + backend together)
✅ Secure API key storage (not in client code)
✅ No CORS issues (same domain)
✅ Auto-scaling (Azure handles traffic spikes)
