Write-Host "Testing specific user that was causing 500 error..."

$userId = "39643628-3c56-4479-ac70-56261b5bfd85"

try {
    Write-Host "Testing itineraries for user: $userId"
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/itineraries/user/$userId" -UseBasicParsing
    $itineraries = $response.Content | ConvertFrom-Json
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
    }
}

Read-Host "Press Enter to continue"