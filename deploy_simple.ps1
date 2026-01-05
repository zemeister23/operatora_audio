# Simple Deploy script using plink (PuTTY) - Alternative method
$SERVER_USER = "operatora_audio"
$SERVER_HOST = "192.168.1.94"
$SERVER_PASS = "Ops2332@"
$REMOTE_DIR = "~/operatora_audio"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Operatora Audio to Linux" -ForegroundColor Cyan
Write-Host "Server: $SERVER_USER@$SERVER_HOST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if plink is available, if not use ssh
$usePlink = $false
if (Get-Command plink -ErrorAction SilentlyContinue) {
    $usePlink = $true
    Write-Host "Using plink (PuTTY)..." -ForegroundColor Yellow
} else {
    Write-Host "Using OpenSSH..." -ForegroundColor Yellow
}

# Create archive of files to deploy
Write-Host "Creating deployment package..." -ForegroundColor Yellow
$tempDir = "$env:TEMP\operatora_deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files
$filesToCopy = @("server.js", "package.json", "package-lock.json", "README.md", "API_DOCUMENTATION.md", "INSTALL_NODEJS.md", ".gitignore", "upload.sh", "deploy.sh")
foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file $tempDir -Force
    }
}

# Copy public directory
if (Test-Path "public") {
    Copy-Item "public" $tempDir -Recurse -Force
}

# Create tar archive
Write-Host "Creating tar archive..." -ForegroundColor Yellow
$archivePath = "$env:TEMP\operatora_audio.tar.gz"
if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

# Use tar if available (Windows 10+)
if (Get-Command tar -ErrorAction SilentlyContinue) {
    Set-Location $tempDir
    tar -czf $archivePath *
    Set-Location $PSScriptRoot
} else {
    Write-Host "ERROR: tar command not found. Please install tar or use WSL." -ForegroundColor Red
    exit 1
}

# Upload archive
Write-Host "Uploading to server..." -ForegroundColor Yellow
if ($usePlink) {
    echo y | plink -ssh "$SERVER_USER@$SERVER_HOST" -pw "$SERVER_PASS" "mkdir -p $REMOTE_DIR"
    pscp -pw "$SERVER_PASS" $archivePath "$SERVER_USER@$SERVER_HOST`:$REMOTE_DIR/operatora_audio.tar.gz"
} else {
    # Use scp if available
    if (Get-Command scp -ErrorAction SilentlyContinue) {
        scp $archivePath "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/operatora_audio.tar.gz"
    } else {
        Write-Host "ERROR: scp not found. Please install OpenSSH client." -ForegroundColor Red
        exit 1
    }
}

# Extract and setup on server
Write-Host "Setting up on remote server..." -ForegroundColor Yellow

$setupScript = @"
cd $REMOTE_DIR
tar -xzf operatora_audio.tar.gz
rm operatora_audio.tar.gz

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
"@

if ($usePlink) {
    echo y | plink -ssh "$SERVER_USER@$SERVER_HOST" -pw "$SERVER_PASS" $setupScript
} else {
    ssh "${SERVER_USER}@${SERVER_HOST}" $setupScript
}

# Cleanup
Remove-Item $tempDir -Recurse -Force
Remove-Item $archivePath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Cyan
Write-Host "  ssh $SERVER_USER@$SERVER_HOST 'cd $REMOTE_DIR && npm start'" -ForegroundColor White
Write-Host ""
