# Switch OTP email to Resend (recommended for inbox delivery).
# 1. Sign up at https://resend.com (free tier)
# 2. Add domain ybproductions.co.in and copy DNS records to GoDaddy
# 3. Run: .\scripts\set-azure-resend.ps1 -ApiKey "re_xxxx"
param(
    [Parameter(Mandatory = $true)]
    [string] $ApiKey
)

$az = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
if (-not (Test-Path $az)) { throw "Azure CLI not found at $az" }

& $az webapp config appsettings set -g yb-productions -n yb-api --settings `
  EMAIL_ENABLED=true `
  EMAIL_PROVIDER=resend `
  RESEND_API_KEY=$ApiKey `
  EMAIL_FROM="Yashvi Bagga Productions <noreply@ybproductions.co.in>" `
  EMAIL_REPLY_TO=noreply@ybproductions.co.in `
  SITE_URL=https://ybproductions.co.in `
  -o none

& $az webapp restart -g yb-productions -n yb-api
Write-Host "Resend configured. Verify ybproductions.co.in DNS on resend.com, then test OTP."
