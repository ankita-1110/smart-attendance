#!/bin/bash

# Script to prepare Firebase key for AWS deployment
# This encodes the service account key to base64 for environment variable

echo "Preparing Firebase key for AWS deployment..."
echo ""

# Check if serviceAccountKey.json exists
if [ ! -f "backend/serviceAccountKey.json" ]; then
    echo "❌ Error: backend/serviceAccountKey.json not found!"
    echo "Please download your Firebase service account key first."
    exit 1
fi

# Encode to base64
ENCODED_KEY=$(cat backend/serviceAccountKey.json | base64 -w 0)

echo "✅ Firebase key encoded successfully!"
echo ""
echo "Use this command to set it in AWS Elastic Beanstalk:"
echo ""
echo "eb setenv FIREBASE_KEY_BASE64=\"$ENCODED_KEY\""
echo ""
echo "Or for AWS Systems Manager Parameter Store:"
echo ""
echo "aws ssm put-parameter \\"
echo "  --name \"/smart-attendance/firebase-key\" \\"
echo "  --value \"$ENCODED_KEY\" \\"
echo "  --type \"SecureString\" \\"
echo "  --overwrite"
echo ""
echo "⚠️  Keep this key secure! Don't commit it to git."

