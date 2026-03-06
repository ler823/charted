import json
import os

import requests


def lambda_handler(event, context):
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    print(os.environ)
    supabase_url = supabase_url + "/users"
    headers = {
        "apikey": supabase_key
    }
    response = requests.get(supabase_url, headers=headers)
    return {
        "statusCode": response.status_code,
        "body": response.text,
    }
