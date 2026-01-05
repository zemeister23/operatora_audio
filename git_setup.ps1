# Git Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from:" -ForegroundColor Yellow
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Git version: $(git --version)" -ForegroundColor Green
Write-Host ""

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    $continue = Read-Host "Continue with setup? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
} else {
    # Initialize Git repository
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Files staged. Ready for commit." -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "Current status:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create commit:" -ForegroundColor White
Write-Host "   git commit -m 'Initial commit: Operatora Audio project'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Add remote repository (GitHub/GitLab):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/USERNAME/operatora_audio.git" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to remote:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "See GIT_SETUP.md for detailed instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
