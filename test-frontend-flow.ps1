Write-Host "Testing complete frontend flow..."

# Simulate the frontend flow
$clerkUserId = "user_36x8rWTCWBRA8qjTCFzf49TzjgN"

try {
    Write-Host "1. Getting backend user ID for Clerk user..."
    
    # First try to find existing user by Clerk ID
    try {
        $userResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/users/clerk/$clerkUserId" -UseBasicParsing
        $user = $userResponse.Content | ConvertFrom-Json
        Write-Host "✅ Found existing user: $($user.id)"
    } catch {
        Write-Host "User not found, creating new user..."
        $createResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/users' -Method POST -Headers @{'Content-Type'='application/json'} -Body "{`"email`":`"clerk-user@example.com`",`"name`":`"Clerk User`",`"clerkUserId`":`"$clerkUserId`"}" -UseBasicParsing
        $user = $createResponse.Content | ConvertFrom-Json
        Write-Host "✅ Created new user: $($user.id)"
    }
    
    Write-Host ""
    Write-Host "2. Getting itineraries for user..."
    $itinerariesResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/itineraries/user/$($user.id)" -UseBasicParsing
    $itineraries = $itinerariesResponse.Content | ConvertFrom-Json
    Write-Host "✅ Found $($itineraries.Count) itineraries"
    
    if ($itineraries.Count -gt 0) {
        Write-Host ""
        Write-Host "Itineraries:"
        foreach ($itinerary in $itineraries) {
            Write-Host "  - $($itinerary.title): $($itinerary.destination) ($($itinerary.startDate) to $($itinerary.endDate))"
        }
    } else {
        Write-Host "No itineraries found for this user."
    }
    
    Write-Host ""
    Write-Host "3. Testing preferences..."
    try {
        $prefsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/users/$($user.id)/preferences" -UseBasicParsing
        $prefs = $prefsResponse.Content | ConvertFrom-Json
        Write-Host "✅ User preferences loaded:"
        Write-Host "  - Interests: $($prefs.interests -join ', ')"
        Write-Host "  - Budget: $($prefs.budgetLevel)"
        Write-Host "  - Style: $($prefs.travelStyle)"
    } catch {
        Write-Host "⚠️ No preferences found (this is normal for new users)"
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}

Read-Host "Press Enter to continue"