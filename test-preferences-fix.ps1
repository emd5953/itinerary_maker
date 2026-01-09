Write-Host "========================================"
Write-Host "TESTING PREFERENCES SAVING FIX"
Write-Host "========================================"
Write-Host ""

try {
    Write-Host "Step 1: Create a test user..."
    $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/users' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"testuser@example.com","name":"Test User","clerkUserId":"test_user_123"}' -UseBasicParsing
    $user = $r.Content | ConvertFrom-Json
    Write-Host "✅ User created: $($user.name) ID: $($user.id)"
    
    Write-Host ""
    Write-Host "Step 2: Save preferences for the user..."
    $r2 = Invoke-WebRequest -Uri "http://localhost:8080/api/users/$($user.id)/preferences" -Method PUT -Headers @{'Content-Type'='application/json'} -Body '{"interests":["sights","food"],"budgetLevel":"MID_RANGE","travelStyle":"BALANCED","dietaryRestrictions":[],"preferredTransport":"WALKING"}' -UseBasicParsing
    Write-Host "✅ Preferences saved successfully"
    
    Write-Host ""
    Write-Host "Step 3: Retrieve preferences to verify..."
    $r3 = Invoke-WebRequest -Uri "http://localhost:8080/api/users/$($user.id)/preferences" -Headers @{'Content-Type'='application/json'} -UseBasicParsing
    $prefs = $r3.Content | ConvertFrom-Json
    Write-Host "✅ Preferences retrieved:"
    Write-Host "  - Interests: $($prefs.interests -join ', ')"
    Write-Host "  - Budget: $($prefs.budgetLevel)"
    Write-Host "  - Style: $($prefs.travelStyle)"
    Write-Host "  - Transport: $($prefs.preferredTransport)"
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)"
    if ($_.Exception.Response) { 
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "If all steps show SUCCESS, preferences saving is fixed!"
Write-Host "========================================"
Read-Host "Press Enter to continue"