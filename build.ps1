# Stop on first error
$ErrorActionPreference = "Stop"

# Kill any running node processes
Write-Host "Stopping any running Node.js processes..."
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Remove the .next directory if it exists
Write-Host "Cleaning build directory..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Run the build
Write-Host "Starting build process..."
npm run build 