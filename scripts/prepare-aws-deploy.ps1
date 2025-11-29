# PowerShell script to prepare Firebase key for AWS deployment (Windows)

Write-Host "Preparing Firebase key for AWS deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if serviceAccountKey.json exists
if (-not (Test-Path "backend\serviceAccountKey.json")) {
    Write-Host "❌ Error: backend\serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Please download your Firebase service account key first."
    exit 1
}

# Read and encode to base64
$keyContent = Get-Content "backend\serviceAccountKey.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($keyContent)
$encodedKey = [Convert]::ToBase64String($bytes)

Write-Host "✅ Firebase key encoded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Use this command to set it in AWS Elastic Beanstalk:" -ForegroundColor Yellow
Write-Host ""
Write-Host "eb setenv FIREBASE_KEY_BASE64=`"$encodedKey`""
Write-Host ""
Write-Host "Or for AWS Systems Manager Parameter Store:" -ForegroundColor Yellow
Write-Host ""
Write-Host "aws ssm put-parameter \"
Write-Host "  --name `/smart-attendance/firebase-key` \"
Write-Host "  --value `"$encodedKey`" \"
Write-Host "  --type `"SecureString`" \"
Write-Host "  --overwrite"
Write-Host ""
Write-Host "⚠️  Keep this key secure! Don't commit it to git." -ForegroundColor Red

