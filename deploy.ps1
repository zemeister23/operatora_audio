# Deploy script for Operatora Audio to Linux server (Windows PowerShell)
$SERVER_USER = "operatora_audio"
$SERVER_HOST = "192.168.1.94"
$SERVER_PASS = "Ops2332@"
$REMOTE_DIR = "~/operatora_audio"
$LOCAL_DIR = "."

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Operatora Audio to Linux" -ForegroundColor Cyan
Write-Host "Server: $SERVER_USER@$SERVER_HOST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Posh-SSH module is available
$poshSSHAvailable = Get-Module -ListAvailable -Name Posh-SSH
if (-not $poshSSHAvailable) {
    Write-Host "Installing Posh-SSH module..." -ForegroundColor Yellow
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser
    Import-Module Posh-SSH
}

# Create secure password
$securePassword = ConvertTo-SecureString $SERVER_PASS -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($SERVER_USER, $securePassword)

try {
    # Create remote directory
    Write-Host "Creating remote directory..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $SERVER_HOST -Credential $credential -AcceptKey
    
    Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p $REMOTE_DIR" | Out-Null
    
    # Copy files using SCP
    Write-Host "Copying files to server..." -ForegroundColor Yellow
    
    # Files to copy (excluding node_modules, uploads, data, .git)
    $filesToCopy = @(
        "server.js",
        "package.json",
        "package-lock.json",
        "README.md",
        "API_DOCUMENTATION.md",
        "INSTALL_NODEJS.md",
        ".gitignore",
        "upload.sh",
        "deploy.sh",
        "public"
    )
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Write-Host "  Copying $file..." -ForegroundColor Gray
            Set-SCPFile -ComputerName $SERVER_HOST -Credential $credential -LocalFile $file -RemotePath "$REMOTE_DIR/" -AcceptKey
        }
    }
    
    # Copy public directory recursively
    if (Test-Path "public") {
        Write-Host "  Copying public directory..." -ForegroundColor Gray
        Get-ChildItem -Path "public" -Recurse -File | ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            $remotePath = "$REMOTE_DIR/$relativePath"
            $remoteDir = Split-Path $remotePath -Parent
            Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p $remoteDir" | Out-Null
            Set-SCPFile -ComputerName $SERVER_HOST -Credential $credential -LocalFile $_.FullName -RemotePath $remotePath -AcceptKey
        }
    }
    
    # Setup on remote server
    Write-Host "Setting up on remote server..." -ForegroundColor Yellow
    
    $setupScript = @"
cd ~/operatora_audio

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing npm..."
    sudo apt-get install -y npm
fi

# Install project dependencies
echo "Installing dependencies..."
npm install

# Make upload.sh executable
chmod +x upload.sh

echo "Setup completed!"
"@
    
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $setupScript
    
    Write-Host $result.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Deployment completed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To connect to server:" -ForegroundColor Cyan
    Write-Host "  ssh $SERVER_USER@$SERVER_HOST" -ForegroundColor White
    Write-Host ""
    Write-Host "To start the server:" -ForegroundColor Cyan
    Write-Host "  ssh $SERVER_USER@$SERVER_HOST 'cd ~/operatora_audio && npm start'" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
