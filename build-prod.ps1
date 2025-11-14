# Build script for production with .env.production
Write-Host "Building for PRODUCTION..." -ForegroundColor Green
Write-Host "Copying .env.production to .env.production.local..." -ForegroundColor Yellow

# Copy .env.production to .env.production.local (highest priority for production)
Copy-Item -Path ".env.production" -Destination ".env.production.local" -Force

# Run Next.js build
Write-Host "Running Next.js build..." -ForegroundColor Yellow
npm run build

# Clean up
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path ".env.production.local" -Force -ErrorAction SilentlyContinue

Write-Host "Production build completed!" -ForegroundColor Green
