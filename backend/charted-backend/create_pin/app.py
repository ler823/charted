import json
import os

import requests


def lambda_handler(event, context):
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    body = json.loads(event["body"])
    pin_data = body["pin_data"]
    supabase_url = supabase_url + "/locations?on_conflict=address"
    headers = {
        "apikey": supabase_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }
    params = {
        "on_conflict": "name"
    }
    data = {
        
    }
    response = requests.post(supabase_url, headers=headers, params=params, data=pin_data)
    return {
        "statusCode": response.status_code,
        "body": response.text,
    }
