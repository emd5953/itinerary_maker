@echo off
echo Testing API Connection...
echo.

echo 1. Testing basic connectivity to localhost:8080
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing -TimeoutSec 10; Write-Host 'Health Check: SUCCESS - Status:' $response.StatusCode } catch { Write-Host 'Health Check: FAILED -' $_.Exception.Message }"
echo.

echo 2. Testing API endpoint with CORS headers
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/itineraries/my' -Headers @{'Origin'='http://localhost:3001'; 'Content-Type'='application/json'} -UseBasicParsing -TimeoutSec 10; Write-Host 'API Test: SUCCESS - Status:' $response.StatusCode } catch { Write-Host 'API Test: FAILED -' $_.Exception.Message }"
echo.

echo 3. Checking if ports are listening
echo Port 8080 (API):
netstat -an | findstr :8080 | findstr LISTENING
echo.
echo Port 3001 (Frontend):
netstat -an | findstr :3001 | findstr LISTENING
echo.

echo Test complete!
pause