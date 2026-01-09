// Global Google Maps loader to prevent multiple script loads
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  // If already loaded, resolve immediately
  if (isLoaded && typeof window.google !== 'undefined') {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (typeof window.google !== 'undefined') {
          clearInterval(checkLoaded);
          isLoaded = true;
          isLoading = false;
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!isLoaded) {
          isLoading = false;
          reject(new Error('Google Maps script load timeout'));
        }
      }, 10000);
      return;
    }

    // Create new script
    const script = document.createElement('script');
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    // Set up global callback
    (window as any)[callbackName] = () => {
      isLoaded = true;
      isLoading = false;
      delete (window as any)[callbackName];
      resolve();
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      isLoading = false;
      delete (window as any)[callbackName];
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof window.google !== 'undefined';
};