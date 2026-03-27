import json
import os

import boto3

s3 = boto3.client("s3")

BUCKET_NAME = os.environ.get("BUCKET_NAME")

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
        keys = body.get("keys", [])
        urls = []
        for key in keys:
            url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={
                    'Bucket': BUCKET_NAME,
                    'Key': key
                },
                ExpiresIn=60
            )
            urls.append({
                "key": key,
                "url": url
            })

        return {
            "statusCode": 200,
            "body": json.dumps({
                "urls": urls
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
