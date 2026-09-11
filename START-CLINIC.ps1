Write-Host ""; Write-Host "Smart Clinic - startup" -ForegroundColor Cyan
Write-Host "This script supplies your MySQL root password only to this PowerShell process." -ForegroundColor Gray
$secure = Read-Host "Enter MySQL root password" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { $env:MYSQL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
Write-Host "Running Maven..." -ForegroundColor Green
mvn clean test
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed. Fix the Maven error above." -ForegroundColor Red; exit $LASTEXITCODE }
mvn spring-boot:run
