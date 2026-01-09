@echo off
echo ========================================
echo QUICK API TEST
echo ========================================
echo.

echo Testing API health...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ API Health: OK' } catch { Write-Host '❌ API Health: FAILED' }"

echo Testing API with CORS...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/itineraries/my' -Headers @{'Origin'='http://localhost:3001'} -UseBasicParsing -TimeoutSec 5; Write-Host '✅ API CORS: OK' } catch { Write-Host '❌ API CORS: FAILED' }"

echo.
echo If both tests show OK, your API is working!
echo If you still get errors in the browser, try:
echo 1. Hard refresh (Ctrl+F5)
echo 2. Clear browser cache
echo 3. Check browser console for specific errors
echo.
pause