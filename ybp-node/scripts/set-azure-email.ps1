# Configure Gmail SMTP on Azure App Service for OTP emails.
# Usage (run after creating Gmail App Password):
#   .\scripts\set-azure-email.ps1 -AppPassword "your16charapppassword"
param(
    [Parameter(Mandatory = $true)]
    [string] $AppPassword
)

$az = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
if (-not (Test-Path $az)) { throw "Azure CLI not found at $az" }

# Gmail app passwords are always 16 characters (spaces are only for display).
$pass = ($AppPassword -replace '\s', '').Trim()
if ($pass.Length -ne 16) {
  throw "Gmail App Password must be 16 characters after removing spaces (got $($pass.Length))."
}

& $az webapp config appsettings set -g yb-productions -n yb-api --settings `
  EMAIL_ENABLED=true `
  SMTP_HOST=smtp.gmail.com `
  SMTP_PORT=587 `
  SMTP_SECURE=false `
  SMTP_USER=noreply1ybproduction@gmail.com `
  SMTP_PASS=$pass `
  EMAIL_FROM="Yashvi Bagga Productions <noreply1ybproduction@gmail.com>" `
  EMAIL_REPLY_TO=noreply1ybproduction@gmail.com `
  SITE_URL=https://ybproductions.co.in `
  AUTH_OTP_REQUIRED=true `
  -o none

& $az webapp restart -g yb-productions -n yb-api
Write-Host "Email SMTP configured. Test Sign Up -> Verify Email on the website."
