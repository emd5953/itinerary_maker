@echo off
echo ========================================
echo TESTING PREFERENCES SAVING FIX
echo ========================================
echo.

echo Step 1: Create a test user...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/users' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"testuser@example.com\",\"name\":\"Test User\",\"clerkUserId\":\"test_user_123\"}' -UseBasicParsing; $user = $r.Content | ConvertFrom-Json; Write-Host '✅ User created:' $user.name 'ID:' $user.id; $env:USER_ID = $user.id } catch { Write-Host '❌ User creation failed:' $_.Exception.Message }"

echo.
echo Step 2: Save preferences for the user...
powershell -Command "try { $r = Invoke-WebRequest -Uri \"http://localhost:8080/api/users/$env:USER_ID/preferences\" -Method PUT -Headers @{'Content-Type'='application/json'} -Body '{\"interests\":[\"sights\",\"food\"],\"budgetLevel\":\"MID_RANGE\",\"travelStyle\":\"BALANCED\",\"dietaryRestrictions\":[],\"preferredTransport\":\"WALKING\"}' -UseBasicParsing; Write-Host '✅ Preferences saved successfully' } catch { Write-Host '❌ Preferences save failed:' $_.Exception.Message }"

echo.
echo Step 3: Retrieve preferences to verify...
powershell -Command "try { $r = Invoke-WebRequest -Uri \"http://localhost:8080/api/users/$env:USER_ID/preferences\" -Headers @{'Content-Type'='application/json'} -UseBasicParsing; $prefs = $r.Content | ConvertFrom-Json; Write-Host '✅ Preferences retrieved:'; Write-Host '  - Interests:' ($prefs.interests -join ', '); Write-Host '  - Budget:' $prefs.budgetLevel; Write-Host '  - Style:' $prefs.travelStyle } catch { Write-Host '❌ Preferences retrieval failed:' $_.Exception.Message }"

echo.
echo ========================================
echo If all steps show SUCCESS, preferences saving is fixed!
echo ========================================
pause