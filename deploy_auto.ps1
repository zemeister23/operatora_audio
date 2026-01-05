# Automated Deploy Script using SSH
$SERVER_USER = "operatora_audio"
$SERVER_HOST = "192.168.1.94"
$SERVER_PASS = "Ops2332@"
$REMOTE_DIR = "~/operatora_audio"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automated Deployment to Linux Server" -ForegroundColor Cyan
Write-Host "Server: $SERVER_USER@$SERVER_HOST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install Posh-SSH if not available
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "Installing Posh-SSH module..." -ForegroundColor Yellow
    try {
        Install-Module -Name Posh-SSH -Force -Scope CurrentUser -AllowClobber
        Import-Module Posh-SSH
        Write-Host "Posh-SSH installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to install Posh-SSH. Trying alternative method..." -ForegroundColor Yellow
    }
}

# Create secure password
$securePassword = ConvertTo-SecureString $SERVER_PASS -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($SERVER_USER, $securePassword)

try {
    Write-Host "Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $SERVER_HOST -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "Connected successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Create remote directory
    Write-Host "Creating remote directory..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p $REMOTE_DIR" | Out-Null
    
    # Copy files
    Write-Host "Copying files..." -ForegroundColor Yellow
    
    # Copy individual files
    $files = @('server.js', 'package.json', 'README.md', 'API_DOCUMENTATION.md', 'INSTALL_NODEJS.md', '.gitignore', 'upload.sh', 'deploy.sh')
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Host "  Uploading $file..." -ForegroundColor Gray
            Set-SCPFile -ComputerName $SERVER_HOST -Credential $credential -LocalFile $file -RemotePath "$REMOTE_DIR/" -AcceptKey
        }
    }
    
    # Copy public directory
    if (Test-Path "public") {
        Write-Host "  Uploading public directory..." -ForegroundColor Gray
        Get-ChildItem -Path "public" -Recurse -File | ForEach-Object {
            $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            $remotePath = "$REMOTE_DIR/$relativePath"
            $remoteDir = Split-Path $remotePath -Parent
            Invoke-SSHCommand -SessionId $session.SessionId -Command "mkdir -p `"$remoteDir`"" | Out-Null
            Set-SCPFile -ComputerName $SERVER_HOST -Credential $credential -LocalFile $_.FullName -RemotePath $remotePath -AcceptKey
        }
    }
    
    # Setup on remote server
    Write-Host ""
    Write-Host "Setting up on remote server..." -ForegroundColor Yellow
    
    $setupCommands = @"
cd $REMOTE_DIR

# Check Node.js
if ! command -v node &> /dev/null; then
    echo 'Installing Node.js...'
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo 'Installing dependencies...'
npm install

# Make scripts executable
chmod +x upload.sh deploy.sh

echo 'Setup completed!'
"@
    
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $setupCommands
    Write-Host $result.Output
    
    if ($result.ExitStatus -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Warning: Some commands may have failed" -ForegroundColor Yellow
        Write-Host "Error: $($result.Error)" -ForegroundColor Red
    }
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
    Write-Host ""
    Write-Host "To start the server:" -ForegroundColor Cyan
    Write-Host "  ssh $SERVER_USER@$SERVER_HOST 'cd $REMOTE_DIR && npm start'" -ForegroundColor White
    Write-Host ""
    Write-Host "Or connect and run manually:" -ForegroundColor Cyan
    Write-Host "  ssh $SERVER_USER@$SERVER_HOST" -ForegroundColor White
    Write-Host "  cd $REMOTE_DIR" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use manual deployment method" -ForegroundColor Yellow
    Write-Host "  .\deploy_windows.ps1" -ForegroundColor White
    exit 1
}
