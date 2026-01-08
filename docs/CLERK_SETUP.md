# Clerk Authentication Setup

## 🚀 Quick Setup Guide

### 1. Create Clerk Account
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose your preferred sign-in methods (email, Google, etc.)

### 2. Get Your Keys
From your Clerk dashboard:
- Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
- Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Environment Variables

Create a `.env` file in the microservices directories or use environment variables:

```bash
# Clerk Configuration (for each microservice)
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here
CLERK_JWKS_URL=https://your-app-name.clerk.accounts.dev/.well-known/jwks.json
```

**Replace `your-app-name` with your actual Clerk app name from the dashboard.**

### 4. Test Authentication

1. Start your microservices: `docker-compose -f docker/docker-compose.microservices.yml up -d`
2. The API Gateway will run on `http://localhost:8080`

**Test endpoints:**
- `GET /api/health` - Public (no auth required)
- `GET /api/users/me` - Protected (requires Clerk token)
- `GET /api/itineraries` - Protected (returns user's itineraries)

### 5. Frontend Integration

In your frontend (React/Next.js), install Clerk:

```bash
npm install @clerk/nextjs
# or
npm install @clerk/react
```

Then use Clerk's components:

```jsx
import { SignIn, SignUp, UserButton } from '@clerk/nextjs';

// Login component
<SignIn />

// User profile button
<UserButton />
```

### 6. Making API Calls

When making requests to your microservices through the API Gateway, include the Clerk token:

```javascript
// Get token from Clerk
const token = await getToken();

// Make authenticated request through API Gateway
fetch('http://localhost:8080/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔧 Configuration Details

### Security Features Enabled:
- ✅ JWT token validation
- ✅ CORS configuration
- ✅ Protected endpoints
- ✅ User context in controllers
- ✅ Automatic user info fetching

### Available Services:
- `ClerkAuthService` - Token validation and user info
- `AuthenticationService` - Get current user in controllers

### Example Controller Usage:

```java
@RestController
@RequiredArgsConstructor
public class ItineraryController {
    
    private final AuthenticationService authService;
    
    @GetMapping("/itineraries")
    public List<Itinerary> getMyItineraries() {
        String userId = authService.getCurrentUserId();
        // Use userId to fetch user's itineraries
        return itineraryService.getByUserId(userId);
    }
}
```

## 🚨 Important Notes

1. **Never commit your secret keys** - Use environment variables
2. **JWKS URL format**: `https://your-app.clerk.accounts.dev/.well-known/jwks.json`
3. **Token format**: Frontend should send `Authorization: Bearer <token>`
4. **Development vs Production**: Use different Clerk apps for dev/prod

## 🔍 Troubleshooting

**Token validation fails?**
- Check your JWKS URL is correct
- Verify the token is being sent with `Bearer ` prefix
- Ensure Clerk app settings match your configuration

**Can't fetch user info?**
- Verify your secret key is correct
- Check network connectivity to Clerk API
- Look at application logs for detailed error messages