@echo off
echo Testing aSpot Core Features...
echo.

echo ========================================
echo 1. Testing User Service - Get Demo User
echo ========================================
curl -s "http://localhost:8081/api/users/550e8400-e29b-41d4-a716-446655440000" | echo.

echo.
echo ========================================
echo 2. Testing User Preferences - Get Demo User Preferences
echo ========================================
curl -s "http://localhost:8081/api/users/550e8400-e29b-41d4-a716-446655440000/preferences" | echo.

echo.
echo ========================================
echo 3. Testing Activity Service - Search Activities
echo ========================================
curl -s "http://localhost:8083/api/activities/search?destination=Paris&limit=3" | echo.

echo.
echo ========================================
echo 4. Testing Activity Service - Get Recommendations
echo ========================================
curl -s "http://localhost:8083/api/activities/recommendations?destination=Paris&limit=3" | echo.

echo.
echo ========================================
echo 5. Testing Itinerary Generation via API Gateway
echo ========================================
curl -X POST "http://localhost:8080/api/itineraries/generate" ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"550e8400-e29b-41d4-a716-446655440000\",\"destination\":\"Paris\",\"startDate\":\"2024-06-01\",\"endDate\":\"2024-06-03\",\"title\":\"Paris Adventure\"}" | echo.

echo.
echo ========================================
echo 6. Testing Preference Update
echo ========================================
curl -X PUT "http://localhost:8081/api/users/550e8400-e29b-41d4-a716-446655440000/preferences" ^
  -H "Content-Type: application/json" ^
  -d "{\"interests\":[\"museums\",\"food\",\"nightlife\"],\"budgetLevel\":\"LUXURY\",\"travelStyle\":\"ADVENTURE\",\"dietaryRestrictions\":[],\"preferredTransport\":\"taxi\"}" | echo.

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If you see JSON responses above, the core features are working!
echo If you see errors, check the logs with: check-logs.bat
echo.
pause