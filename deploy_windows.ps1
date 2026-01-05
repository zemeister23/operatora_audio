# Windows PowerShell Deploy Script
$SERVER_USER = "operatora_audio"
$SERVER_HOST = "192.168.1.94"
$SERVER_PASS = "Ops2332@"
$REMOTE_DIR = "~/operatora_audio"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Operatora Audio to Linux" -ForegroundColor Cyan
Write-Host "Server: $SERVER_USER@$SERVER_HOST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create zip if not exists
if (-not (Test-Path "operatora_audio.zip")) {
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    $files = @('server.js', 'package.json', 'README.md', 'API_DOCUMENTATION.md', 'INSTALL_NODEJS.md', '.gitignore', 'upload.sh', 'deploy.sh')
    $filesToZip = @()
    foreach ($file in $files) {
        if (Test-Path $file) {
            $filesToZip += $file
        }
    }
    if (Test-Path "public") {
        $filesToZip += "public"
    }
    Compress-Archive -Path $filesToZip -DestinationPath "operatora_audio.zip" -Force
    Write-Host "Created operatora_audio.zip" -ForegroundColor Green
}

# Upload zip file
Write-Host "Uploading to server..." -ForegroundColor Yellow

# Try using scp (OpenSSH)
if (Get-Command scp -ErrorAction SilentlyContinue) {
    Write-Host "Using scp..." -ForegroundColor Gray
    # Create expect script for password
    $expectScript = @"
spawn scp operatora_audio.zip ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/operatora_audio.zip
expect "password:"
send "${SERVER_PASS}\r"
expect eof
"@
    # For now, we'll use manual method
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host "  scp operatora_audio.zip ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use WinSCP/PuTTY PSCP" -ForegroundColor Yellow
} else {
    Write-Host "scp not found. Please install OpenSSH client or use WinSCP" -ForegroundColor Yellow
}

# Setup script for remote server
$setupScript = @"
#!/bin/bash
cd $REMOTE_DIR

# Create directory if not exists
mkdir -p $REMOTE_DIR

# Extract zip (if uploaded)
if [ -f operatora_audio.zip ]; then
    unzip -o operatora_audio.zip
    rm operatora_audio.zip
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Make scripts executable
chmod +x upload.sh deploy.sh

echo "Setup completed!"
echo ""
echo "To start server: cd $REMOTE_DIR && npm start"
"@

# Save setup script
$setupScript | Out-File -FilePath "remote_setup.sh" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload operatora_audio.zip to server" -ForegroundColor White
Write-Host "2. Upload remote_setup.sh to server" -ForegroundColor White
Write-Host "3. SSH to server and run:" -ForegroundColor White
Write-Host "   ssh $SERVER_USER@$SERVER_HOST" -ForegroundColor Yellow
Write-Host "   cd $REMOTE_DIR" -ForegroundColor Yellow
Write-Host "   bash remote_setup.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use automated method with Posh-SSH:" -ForegroundColor Cyan
Write-Host "   .\deploy.ps1" -ForegroundColor White
Write-Host ""
