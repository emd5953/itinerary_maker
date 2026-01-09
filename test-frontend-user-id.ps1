Write-Host "Testing frontend user ID resolution..."

# Let's test the user service endpoints that the frontend uses
try {
    Write-Host "1. Testing user creation with Clerk ID..."
    $clerkUserId = "user_36x8rWTCWBRA8qjTCFzf49TzjgN"  # This is from the JWT token in the logs
    $userResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/users' -Method POST -Headers @{'Content-Type'='application/json'} -Body "{`"email`":`"clerk-user@example.com`",`"name`":`"Clerk User`",`"clerkUserId`":`"$clerkUserId`"}" -UseBasicParsing
    $user = $userResponse.Content | ConvertFrom-Json
    Write-Host "✅ User created/found: $($user.id) for Clerk ID: $clerkUserId"
    
    Write-Host ""
    Write-Host "2. Testing user lookup by Clerk ID..."
    $lookupResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/users/clerk/$clerkUserId" -UseBasicParsing
    $foundUser = $lookupResponse.Content | ConvertFrom-Json
    Write-Host "✅ User found by Clerk ID: $($foundUser.id)"
    
    Write-Host ""
    Write-Host "3. Testing itineraries for this user..."
    $itinerariesResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/itineraries/user/$($foundUser.id)" -UseBasicParsing
    $itineraries = $itinerariesResponse.Content | ConvertFrom-Json
    Write-Host "✅ User itineraries: $($itineraries.Count) itineraries"
    
    if ($itineraries.Count -gt 0) {
        foreach ($itinerary in $itineraries) {
            Write-Host "  - $($itinerary.title): $($itinerary.destination)"
        }
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        try {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorText = $reader.ReadToEnd()
            Write-Host "Error details: $errorText"
        } catch {
            Write-Host "Could not read error details"
        }
    }
}

Read-Host "Press Enter to continue"