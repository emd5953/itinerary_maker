# GPS Map Setup Guide

This guide will help you set up the GPS functionality for the itinerary maps.

## Google Maps API Setup

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geolocation API

### 2. Create API Key

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the API key:
   - Set application restrictions (HTTP referrers for web)
   - Set API restrictions to only the APIs you enabled

### 3. Configure Environment Variables

1. Open `frontend/.env.local`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 4. Test the Setup

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Navigate to an itinerary page
3. Click the "Map" view button
4. You should see an interactive Google Map with GPS functionality

## GPS Features

### Current Location
- Click "Get My Location" to find your current GPS coordinates
- The map will show a red marker at your location
- Location accuracy is displayed when available

### Navigation
- Click "Navigate" on any activity to get directions from your current location
- Use "Navigate Here" in activity details for specific navigation
- "Open in Google Maps" opens the full Google Maps app/website

### Route Planning
- "Show Route" displays an optimized walking route between all activities
- Routes are calculated using Google's Directions API
- Multi-stop routes are supported for complex itineraries

### Interactive Map
- Zoom, pan, and interact with the map
- Click activity markers to see details
- Different colored markers for different activity categories
- Street view and satellite view available

## Troubleshooting

### Map Not Loading
- Check that your API key is correctly set in `.env.local`
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for error messages

### Location Not Working
- Ensure your browser allows location access
- HTTPS is required for geolocation in most browsers
- Check that Geolocation API is enabled

### Routes Not Calculating
- Verify Directions API is enabled
- Check that activities have valid coordinates
- Some locations may not be accessible by walking routes

### API Quotas
- Google Maps APIs have usage quotas and billing
- Monitor your usage in Google Cloud Console
- Consider setting up billing alerts

## Security Notes

- Never commit your API key to version control
- Use HTTP referrer restrictions for production
- Consider using server-side proxy for sensitive operations
- Monitor API usage regularly

## Development vs Production

### Development
- Use unrestricted API key for easier testing
- Enable all necessary APIs
- Monitor console for errors

### Production
- Implement proper API key restrictions
- Set up billing and quotas
- Use environment-specific API keys
- Consider implementing rate limiting