# Audio Upload Script using curl
$uri = "http://localhost:3000/api/upload"
$audioPath = "C:\Users\WESOLVE\Desktop\work\operatora_audio\file_example_MP3_2MG.mp3"

# Check if file exists
if (-not (Test-Path $audioPath)) {
    Write-Host "ERROR: Audio file not found at: $audioPath" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Uploading audio file..." -ForegroundColor Yellow
Write-Host "File: $audioPath" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Use curl.exe (available in Windows 10+)
    $curlPath = "curl.exe"
    
    # Check if curl is available
    if (-not (Get-Command $curlPath -ErrorAction SilentlyContinue)) {
        throw "curl.exe not found. Please use PowerShell 5.1+ or install curl."
    }
    
    # Build curl command
    $curlArgs = @(
        "-X", "POST",
        $uri,
        "-F", "audio=@`"$audioPath`"",
        "-F", "name=John",
        "-F", "surname=Doe",
        "-s", "-S"  # Silent but show errors
    )
    
    Write-Host "Executing curl command..." -ForegroundColor Gray
    Write-Host ""
    
    # Execute curl and capture output
    $output = & $curlPath $curlArgs 2>&1
    
    # Check if curl was successful
    if ($LASTEXITCODE -eq 0) {
        # Parse JSON response
        $result = $output | ConvertFrom-Json
        
        # Display success message
        Write-Host "[SUCCESS] Upload completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host ($result | ConvertTo-Json -Depth 10)
        Write-Host ""
        Write-Host "Audio Details:" -ForegroundColor Cyan
        Write-Host "  ID: $($result.audio.id)" -ForegroundColor White
        Write-Host "  Original Name: $($result.audio.originalName)" -ForegroundColor White
        Write-Host "  Owner: $($result.audio.owner.name) $($result.audio.owner.surname)" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($result.audio.size / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  Format: $($result.audio.format)" -ForegroundColor White
        Write-Host "  Uploaded At: $($result.audio.uploadedAt)" -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
    } else {
        throw "curl failed with exit code $LASTEXITCODE. Output: $output"
    }
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Upload failed!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($output) {
        Write-Host "Output: $output" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternative: Make sure server is running with 'npm start'" -ForegroundColor Yellow
    exit 1
}
