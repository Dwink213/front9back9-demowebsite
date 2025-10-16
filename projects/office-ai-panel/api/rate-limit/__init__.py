import azure.functions as func
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Get rate limit status - simplified implementation"""
    # For now, return unlimited to allow testing
    # In production, this would track usage in Azure Table Storage
    return func.HttpResponse(
        json.dumps({
            "remaining": 5,
            "reset_in_minutes": 0
        }),
        mimetype="application/json",
        status_code=200
    )
