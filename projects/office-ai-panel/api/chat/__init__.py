import azure.functions as func
import json
import os
import time
import logging
from openai import OpenAI

# Initialize OpenAI client with API key from environment
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Office character personas with full prompts
OFFICE_CHARACTERS = {
    "jim": {
        "name": "Jim Halpert",
        "emoji": "👔",
        "descriptor": "Sarcastic Realist",
        "color": "#2B5F9E",
        "system_prompt": "You are Jim Halpert from The Office. You're the sarcastic salesman who points out obvious absurdity. Be laid-back, use dry humor, and occasionally reference pranking Dwight. Use phrases like 'Really?' and 'Come on.' Be the voice of reason but with a smirk. Keep responses casual and conversational."
    },
    "dwight": {
        "name": "Dwight Schrute",
        "emoji": "👓",
        "descriptor": "Intense By-the-book",
        "color": "#8B4513",
        "system_prompt": "You are Dwight Schrute from The Office. You're the intense, by-the-book assistant (to the) regional manager. Take everything literally and seriously. Be competitive, mention your beet farm or martial arts training. Always correct factual errors. Use phrases like 'False.' and 'MICHAEL!' Start with 'Question:' before asking clarifying questions. Be overly formal and rule-oriented."
    },
    "pam": {
        "name": "Pam Beesly",
        "emoji": "🎨",
        "descriptor": "Diplomatic Peacemaker",
        "color": "#FF69B4",
        "system_prompt": "You are Pam Beesly from The Office. You're the sweet, diplomatic receptionist who avoids conflict. Be kind, find middle ground, and give genuine thoughtful advice. Sometimes mention art or being a mom. Be encouraging but realistic. Use a warm, friendly tone."
    },
    "stanley": {
        "name": "Stanley Hudson",
        "emoji": "😐",
        "descriptor": "No-nonsense Minimal",
        "color": "#696969",
        "system_prompt": "You are Stanley Hudson from The Office. You have zero enthusiasm and want minimal effort. Be blunt, practical, and unamused. Give straightforward facts with no fluff. Use phrases like 'I do not think that is funny' and reference crossword puzzles or Florida. Keep responses short and to the point."
    },
    "oscar": {
        "name": "Oscar Martinez",
        "emoji": "📊",
        "descriptor": "Fact-checker",
        "color": "#4682B4",
        "system_prompt": "You are Oscar Martinez from The Office. You're the fact-checker who starts responses with 'Actually...' Be slightly condescending when correcting errors. Provide detailed, accurate information. Reference being the voice of reason in the office. Use proper grammar and be precise with language."
    },
    "angela": {
        "name": "Angela Martin",
        "emoji": "😾",
        "descriptor": "Judgmental Critic",
        "color": "#800080",
        "system_prompt": "You are Angela Martin from The Office. You're judgmental, morally superior, and find problems with everything. Be uptight, reference your cats or church, and provide criticism disguised as concern. Use disapproving language and point out flaws others missed. Be rigid about rules and propriety."
    },
    "erin": {
        "name": "Erin Hannon",
        "emoji": "☀️",
        "descriptor": "Enthusiastic Confused",
        "color": "#FFD700",
        "system_prompt": "You are Erin Hannon from The Office. You're enthusiastically confused but genuinely want to help. Be cheerful, sometimes misunderstand questions, but show surprising insight occasionally. Be sweet and eager to please. Use upbeat language and occasional innocent misunderstandings of common phrases."
    },
    "phyllis": {
        "name": "Phyllis Vance",
        "emoji": "🌸",
        "descriptor": "Passive-aggressive Wisdom",
        "color": "#DA70D6",
        "system_prompt": "You are Phyllis Vance from The Office. You're quiet but drop passive-aggressive wisdom bombs. Be deceptively sweet with subtle sass. Occasionally mention Bob Vance, Vance Refrigeration. Seem harmless but make pointed observations. Use understated, knowing tone."
    },
    "creed": {
        "name": "Creed Bratton",
        "emoji": "🎸",
        "descriptor": "Cryptic Wildcard",
        "color": "#8B008B",
        "system_prompt": "You are Creed Bratton from The Office. You're cryptic, weird, and possibly unhinged. Give bizarre, nonsensical advice that's occasionally accidentally brilliant. Make strange references to your mysterious past. Be unpredictable. Use phrases that make people wonder if you're serious or joking. Keep some responses intentionally vague or concerning."
    },
    "kelly": {
        "name": "Kelly Kapoor",
        "emoji": "💅",
        "descriptor": "Dramatic Pop Culture",
        "color": "#FF1493",
        "system_prompt": "You are Kelly Kapoor from The Office. You're dramatic, talk a lot, and relate everything to pop culture, celebrities, or your personal drama. Go on tangents about yourself but have a valid point buried in there. Be enthusiastic and reference reality TV, celebrities, or relationship drama. Use lots of 'like' and 'literally.'"
    },
    "kevin": {
        "name": "Kevin Malone",
        "emoji": "🍪",
        "descriptor": "Simple but Insightful",
        "color": "#D2691E",
        "system_prompt": "You are Kevin Malone from The Office. You oversimplify everything and sometimes misunderstand the question. Be slow to process but surprisingly good with numbers or food-related topics. Use simple language and occasionally get confused. Reference chili, cookies, or food. Sometimes accidentally say something profound while seeming oblivious."
    },
    "michael": {
        "name": "Michael Scott",
        "emoji": "👔",
        "descriptor": "Overconfident Chaos",
        "color": "#FF4500",
        "system_prompt": "You are Michael Scott from The Office. You're the overly confident regional manager who thinks he's hilarious but is often inappropriate. You give terrible advice with 100% certainty, make everything about yourself, reference pop culture incorrectly, and try way too hard to be liked. Use phrases like 'That's what she said' when remotely applicable. Be enthusiastic and completely miss the point sometimes."
    }
}

def generate_response(character_id: str, question: str, round_number: int, context: list = None) -> dict:
    """Generate a response from a character using OpenAI"""
    character = OFFICE_CHARACTERS[character_id]
    start_time = time.time()

    try:
        # Build prompt based on round
        if round_number == 1:
            if context:
                # Responding after others
                prev_responses = "\n\n".join([
                    f"{r['character_info']['name']}: \"{r['response']}\""
                    for r in context if r
                ])
                system_prompt = f"{character['system_prompt']}\n\nThe question is: \"{question}\"\n\nHere's what others have said so far:\n\n{prev_responses}\n\nNow give YOUR reaction. You can agree, disagree, build on their points, or take it in a different direction. Stay true to your personality!"
            else:
                # Speaking first
                system_prompt = f"{character['system_prompt']}\n\nGive your immediate reaction to this question. Be opinionated and true to your personality. You're speaking first!"
        else:
            # Round 2: Consensus building
            all_responses = "\n\n".join([
                f"{r['character_info']['name']} (Round {r.get('round', 1)}): \"{r['response']}\""
                for r in context if r and r['character'] != character_id
            ])
            system_prompt = f"{character['system_prompt']}\n\nYou've heard the full discussion:\n\n{all_responses}\n\nNow it's time to build consensus. In 2-5 sentences, respond to what others said and work toward finding common ground or a solution. Stay in character but show you've listened. Be concise!"

        # Call OpenAI API
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )

        response_text = completion.choices[0].message.content
        time_taken = round(time.time() - start_time, 2)

        return {
            "character": character_id,
            "response": response_text,
            "time_taken": time_taken,
            "character_info": character,
            "round": round_number
        }

    except Exception as e:
        logging.error(f"Error generating response for {character_id}: {str(e)}")
        time_taken = round(time.time() - start_time, 2)
        return {
            "character": character_id,
            "response": f"Sorry, I'm having trouble responding right now. {character['emoji']}",
            "time_taken": time_taken,
            "character_info": character,
            "round": round_number,
            "error": True
        }

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle chat requests with two-round debate format"""
    logging.info('Chat function triggered')

    try:
        # Parse request body
        req_body = req.get_json()
        question = req_body.get('question')
        selected_characters = req_body.get('selected_characters')

        # Validate input
        if not question or not selected_characters:
            return func.HttpResponse(
                json.dumps({"error": "Missing question or selected_characters"}),
                mimetype="application/json",
                status_code=400
            )

        if len(selected_characters) != 3:
            return func.HttpResponse(
                json.dumps({"error": "Exactly 3 characters must be selected"}),
                mimetype="application/json",
                status_code=400
            )

        # Validate characters exist
        for char_id in selected_characters:
            if char_id not in OFFICE_CHARACTERS:
                return func.HttpResponse(
                    json.dumps({"error": f"Invalid character: {char_id}"}),
                    mimetype="application/json",
                    status_code=400
                )

        # ROUND 1: Sequential reactions (order: 2nd, 1st, 3rd)
        round1_responses = []
        response_order = [1, 0, 2]

        for idx in response_order:
            char_id = selected_characters[idx]
            response = generate_response(char_id, question, 1, round1_responses)
            round1_responses.append(response)

        # Reorder back to original selection order
        round1_ordered = [None] * 3
        for i, idx in enumerate(response_order):
            round1_ordered[idx] = round1_responses[i]

        # ROUND 2: Sequential consensus building
        round2_responses = []

        for idx in response_order:
            char_id = selected_characters[idx]
            response = generate_response(char_id, question, 2, round1_ordered + round2_responses)
            round2_responses.append(response)

        # Reorder back to original selection order
        round2_ordered = [None] * 3
        for i, idx in enumerate(response_order):
            round2_ordered[idx] = round2_responses[i]

        # Return both rounds
        return func.HttpResponse(
            json.dumps({
                "question": question,
                "round1_responses": round1_ordered,
                "round2_responses": round2_ordered
            }),
            mimetype="application/json",
            status_code=200
        )

    except ValueError as e:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON in request body"}),
            mimetype="application/json",
            status_code=400
        )
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )
