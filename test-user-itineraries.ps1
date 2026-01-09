Write-Host "Testing user itineraries endpoint..."

# First, let's test with the demo user ID that should exist
$demoUserId = "550e8400-e29b-41d4-a716-446655440000"

try {
    Write-Host "Testing with demo user ID: $demoUserId"
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/itineraries/user/$demoUserId" -UseBasicParsing
    $itineraries = $response.Content | ConvertFrom-Json
    Write-Host "✅ Demo user itineraries found: $($itineraries.Count) itineraries"
    
    if ($itineraries.Count -gt 0) {
        Write-Host "First itinerary: $($itineraries[0].title) - $($itineraries[0].destination)"
    }
} catch {
    Write-Host "❌ Demo user endpoint failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host ""

# Now let's test with a user ID that was created recently
try {
    Write-Host "Creating a test user to get a real user ID..."
    $userResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/users' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{"email":"testuser2@example.com","name":"Test User 2","clerkUserId":"test_user_456"}' -UseBasicParsing
    $user = $userResponse.Content | ConvertFrom-Json
    Write-Host "✅ Test user created: $($user.id)"
    
    Write-Host "Testing itineraries for new user: $($user.id)"
    $response2 = Invoke-WebRequest -Uri "http://localhost:8080/api/itineraries/user/$($user.id)" -UseBasicParsing
    $itineraries2 = $response2.Content | ConvertFrom-Json
    Write-Host "✅ New user itineraries: $($itineraries2.Count) itineraries"
    
} catch {
    Write-Host "❌ New user test failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
    }
}

Read-Host "Press Enter to continue"