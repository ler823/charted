import json
import os
import uuid

import boto3

s3 = boto3.client("s3")

BUCKET_NAME = os.environ.get("BUCKET_NAME")

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        content_type = body.get("contentType")

        key = f"uploads/{uuid.uuid4()}.jpg"

        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": key,
                "ContentType": content_type
            },
            ExpiresIn=60
        )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "uploadUrl": url,
                "key": key
            })
        }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
