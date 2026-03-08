import json
import os

import requests


def lambda_handler(event, context):
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    body = json.loads(event["body"])
    pin_data = body["pin_data"]
    supabase_url = supabase_url + "/rpc/create_pin"
    headers = {
        "apikey": supabase_key,
        "Content-Type": "application/json"
    }
    data = {
        "p_latitude": pin_data["latitude"],
        "p_longitude": pin_data["longitude"],
        "p_pin_name": pin_data["pin_name"],
        "p_user_note": pin_data["user_notes"],
        "p_user_rating": pin_data["user_rating"],
        "p_username": pin_data["username"]
    }
    response = requests.post(supabase_url, headers=headers, json=data)
    return {
        "statusCode": response.status_code,
        "body": response.text,
    }
