import azure.functions as func
import json

OFFICE_CHARACTERS = {
    "jim": {
        "name": "Jim Halpert",
        "emoji": "👔",
        "descriptor": "Sarcastic Realist",
        "color": "#2B5F9E"
    },
    "dwight": {
        "name": "Dwight Schrute",
        "emoji": "👓",
        "descriptor": "Intense By-the-book",
        "color": "#8B4513"
    },
    "pam": {
        "name": "Pam Beesly",
        "emoji": "🎨",
        "descriptor": "Diplomatic Peacemaker",
        "color": "#FF69B4"
    },
    "stanley": {
        "name": "Stanley Hudson",
        "emoji": "😐",
        "descriptor": "No-nonsense Minimal",
        "color": "#696969"
    },
    "oscar": {
        "name": "Oscar Martinez",
        "emoji": "📊",
        "descriptor": "Fact-checker",
        "color": "#4682B4"
    },
    "angela": {
        "name": "Angela Martin",
        "emoji": "😾",
        "descriptor": "Judgmental Critic",
        "color": "#800080"
    },
    "erin": {
        "name": "Erin Hannon",
        "emoji": "☀️",
        "descriptor": "Enthusiastic Confused",
        "color": "#FFD700"
    },
    "phyllis": {
        "name": "Phyllis Vance",
        "emoji": "🌸",
        "descriptor": "Passive-aggressive Wisdom",
        "color": "#DA70D6"
    },
    "creed": {
        "name": "Creed Bratton",
        "emoji": "🎸",
        "descriptor": "Cryptic Wildcard",
        "color": "#8B008B"
    },
    "kelly": {
        "name": "Kelly Kapoor",
        "emoji": "💅",
        "descriptor": "Dramatic Pop Culture",
        "color": "#FF1493"
    },
    "kevin": {
        "name": "Kevin Malone",
        "emoji": "🍪",
        "descriptor": "Simple but Insightful",
        "color": "#D2691E"
    },
    "michael": {
        "name": "Michael Scott",
        "emoji": "👔",
        "descriptor": "Overconfident Chaos",
        "color": "#FF4500"
    }
}

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Get all available characters"""
    return func.HttpResponse(
        json.dumps({"characters": OFFICE_CHARACTERS}),
        mimetype="application/json",
        status_code=200
    )
