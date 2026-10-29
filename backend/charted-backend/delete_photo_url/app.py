import json
import os

import boto3

# Use the regional endpoint so presigned URLs don't hit the global
# endpoint's redirect (which breaks the signature on new buckets)
REGION = os.environ.get("AWS_REGION", "us-east-2")
s3 = boto3.client(
    "s3",
    region_name=REGION,
    endpoint_url=f"https://s3.{REGION}.amazonaws.com",
)

BUCKET_NAME = os.environ.get("BUCKET_NAME")

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
        key = body["key"]

        url = s3.generate_presigned_url(
            ClientMethod='delete_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': key
            },
            ExpiresIn=60
        )

        return {
            "statusCode": 200,
            "body": json.dumps({
                "url": url
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }