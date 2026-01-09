// Debug utilities for troubleshooting API and Google Maps issues

export const debugApiConnection = async (baseUrl: string = 'http://localhost:8080/api'): Promise<void> => {
  console.log('🔍 Debugging API connection...');
  console.log('Base URL:', baseUrl);
  
  try {
    // Test basic connectivity
    const healthUrl = baseUrl.replace('/api', '/actuator/health');
    console.log('Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check passed:', data);
    } else {
      console.log('❌ Health check failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error);
  }
};

export const debugGoogleMapsSetup = (): void => {
  console.log('🗺️ Debugging Google Maps setup...');
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('API Key configured:', apiKey ? '✅ Yes' : '❌ No');
  
  if (apiKey) {
    console.log('API Key length:', apiKey.length);
    console.log('API Key preview:', `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log('Is placeholder:', apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? '❌ Yes' : '✅ No');
  }
  
  console.log('Google Maps loaded:', typeof window !== 'undefined' && typeof window.google !== 'undefined' ? '✅ Yes' : '❌ No');
  
  const existingScript = typeof document !== 'undefined' ? document.querySelector('script[src*="maps.googleapis.com"]') : null;
  console.log('Google Maps script in DOM:', existingScript ? '✅ Yes' : '❌ No');
};

// Call this in your component to debug issues
export const runDiagnostics = async (): Promise<void> => {
  console.log('🚀 Running aSpot diagnostics...');
  debugGoogleMapsSetup();
  await debugApiConnection();
  console.log('✅ Diagnostics complete');
};