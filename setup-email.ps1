# Supabase Email Setup Script
# Run this in PowerShell to set up email sending

Write-Host "🚗 AR Car Rentals - Supabase Email Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Supabase CLI is installed
Write-Host "Step 1: Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseExists = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseExists) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase CLI already installed" -ForegroundColor Green
}

Write-Host ""

# Step 2: Login
Write-Host "Step 2: Login to Supabase..." -ForegroundColor Yellow
Write-Host "This will open your browser. Please authorize the CLI." -ForegroundColor Gray
supabase login

Write-Host ""

# Step 3: Link project
Write-Host "Step 3: Linking to your Supabase project..." -ForegroundColor Yellow
supabase link --project-ref dnexspoyhhqflatuyxje

Write-Host ""

# Step 4: Set Resend API Key
Write-Host "Step 4: Setting Resend API Key..." -ForegroundColor Yellow
Write-Host "Please enter your Resend API key (starts with 're_'):" -ForegroundColor Gray
$resendKey = Read-Host "Resend API Key"

if ($resendKey) {
    supabase secrets set RESEND_API_KEY=$resendKey
    Write-Host "✅ Resend API key set!" -ForegroundColor Green
} else {
    Write-Host "⚠️ No API key provided. You can set it later with:" -ForegroundColor Yellow
    Write-Host "supabase secrets set RESEND_API_KEY=your_key_here" -ForegroundColor Gray
}

Write-Host ""

# Step 5: Deploy function
Write-Host "Step 5: Deploying email function..." -ForegroundColor Yellow
supabase functions deploy send-booking-email

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your email function is deployed at:" -ForegroundColor Cyan
Write-Host "https://dnexspoyhhqflatuyxje.supabase.co/functions/v1/send-booking-email" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server: npm run dev" -ForegroundColor Gray
Write-Host "2. Create a test booking with your email" -ForegroundColor Gray
Write-Host "3. Check your inbox for confirmation email!" -ForegroundColor Gray
Write-Host ""
Write-Host "To view function logs:" -ForegroundColor Yellow
Write-Host "supabase functions logs send-booking-email --tail" -ForegroundColor Gray
Write-Host ""
