import { userService } from './user-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Debug function to test API connectivity
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    // Test the health endpoint first (no auth required)
    const healthUrl = `${API_BASE_URL.replace('/api', '')}/actuator/health`;
    console.log('Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API health check passed:', data);
      return true;
    } else {
      console.error('❌ API health check failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
};

// Wait for API to be ready
export const waitForApiReady = async (maxAttempts: number = 10): Promise<boolean> => {
  console.log('🔄 Waiting for API to be ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isReady = await testApiConnection();
      if (isReady) {
        console.log('✅ API is ready!');
        return true;
      }
    } catch (error) {
      console.log(`❌ API not ready (attempt ${attempt}/${maxAttempts}):`, error);
    }
    
    if (attempt < maxAttempts) {
      const delay = Math.min(1000 * attempt, 5000); // Progressive delay, max 5s
      console.log(`⏳ Waiting ${delay}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('❌ API failed to become ready after', maxAttempts, 'attempts');
  return false;
};

// Utility function to format time from HH:mm:ss to HH:mm
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // "10:00:00" -> "10:00"
};

export interface GenerateItineraryRequest {
  destination: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  userId?: string;   // Optional for backward compatibility
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    country?: string;
    placeId?: string;
  };
  rating?: number;
  priceRange?: string;
  websiteUrl?: string;
  tags?: string[];
}

export interface ScheduledActivity extends Activity {
  startTime: string; // HH:mm:ss format from backend
  endTime: string;   // HH:mm:ss format from backend
  estimatedDuration?: number; // minutes
}

export interface DayPlan {
  id: string;
  date: string; // ISO date string
  activities: ScheduledActivity[];
  notes?: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  profilePicture?: string;
  preferences?: {
    interests: string[];
    budgetLevel: string;
    travelStyle: string;
    dietaryRestrictions: string[];
    preferredTransport: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  owner: User;
  dayPlans: DayPlan[];
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface TravelTimeResult {
  duration: number; // minutes
  distance: number; // meters
  mode: string;
  route?: {
    steps: Array<{
      instruction: string;
      duration: number;
      distance: number;
    }>;
  };
}

class ApiService {
  private async getAuthHeaders(token?: string | null): Promise<HeadersInit> {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Make request method public so user service can use it
  async request<T>(endpoint: string, options: RequestInit = {}, token?: string | null, retries: number = 3): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders(token);

    console.log('Making API request:', { url, method: options.method || 'GET', attempt: 4 - retries }); // Debug log

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('API response:', { status: response.status, statusText: response.statusText, attempt: attempt + 1 }); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText); // Debug log
          
          // Handle specific HTTP errors
          if (response.status === 404) {
            throw new Error('Resource not found. Please check the URL and try again.');
          } else if (response.status === 401) {
            throw new Error('Authentication required. Please sign in and try again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You don\'t have permission to access this resource.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          }
          
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data); // Debug log
        return data;
      } catch (error) {
        const isLastAttempt = attempt === retries - 1;
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error(`API request timed out (attempt ${attempt + 1}):`, url);
            if (isLastAttempt) {
              throw new Error('Request timed out. Please check your connection and try again.');
            }
          } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('fetch')) {
            console.error(`Network error (attempt ${attempt + 1}):`, error.message);
            if (isLastAttempt) {
              throw new Error('Network error. Please check your internet connection and try again.');
            }
          } else {
            // Non-network errors shouldn't be retried
            console.error('API request failed:', error.message);
            throw error;
          }
        } else {
          console.error('Unknown API error:', error);
          if (isLastAttempt) {
            throw new Error('An unexpected error occurred. Please try again.');
          }
        }
        
        // Wait before retrying (exponential backoff)
        if (!isLastAttempt) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5 seconds
          console.log(`Retrying in ${delay}ms... (${retries - attempt - 1} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  // Health check (no auth required) - Currently not available through API gateway
  async healthCheck(): Promise<{ status: string; database: string; redis: string }> {
    try {
      // Direct gateway health check (not through /api path)
      const url = `${API_BASE_URL.replace('/api', '')}/actuator/health`;
      console.log('Health check URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a shorter timeout for health checks
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Health check successful:', data);
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Generate itinerary
  async generateItinerary(request: GenerateItineraryRequest, token?: string | null, clerkUser?: any): Promise<Itinerary> {
    let userId: string;
    
    if (request.userId) {
      // Use provided userId
      userId = request.userId;
    } else if (clerkUser) {
      // Get backend user ID for Clerk user
      userId = await userService.getBackendUserId(clerkUser, token);
    } else {
      throw new Error('No user ID provided. Please sign in to create itineraries.');
    }
    
    const params = new URLSearchParams({
      userId: userId,
      destination: request.destination,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    return this.request(`/itineraries/generate?${params.toString()}`, {
      method: 'POST',
    }, token);
  }

  // Get user's itineraries
  async getMyItineraries(token?: string | null, clerkUser?: any): Promise<Itinerary[]> {
    if (!clerkUser) {
      throw new Error('No user provided. Please sign in to view your itineraries.');
    }

    try {
      // Get backend user ID for Clerk user
      const backendUserId = await userService.getBackendUserId(clerkUser, token);
      
      // Try the proper user endpoint first
      try {
        return await this.request(`/itineraries/user/${backendUserId}`, {}, token);
      } catch (error) {
        console.warn('User endpoint failed, trying workaround:', error);
        
        // Fallback: Search multiple destinations and filter by user
        const destinations = ['Tokyo', 'Paris', 'London', 'New York', 'Rome', 'Barcelona', 'Berlin', 'Madrid', 'Amsterdam', 'Vienna'];
        const allItineraries: Itinerary[] = [];
        
        for (const destination of destinations) {
          try {
            const itineraries = await this.request(`/itineraries/search?destination=${encodeURIComponent(destination)}`, {}, token);
            if (Array.isArray(itineraries)) {
              allItineraries.push(...itineraries);
            }
          } catch (error) {
            console.warn(`Failed to search for ${destination}:`, error);
          }
        }
        
        // Filter by the user's backend ID
        const userItineraries = allItineraries.filter(itinerary => {
          const ownerId = (itinerary as any).ownerId || itinerary.owner?.id;
          return ownerId === backendUserId;
        });
        
        console.log(`Found ${userItineraries.length} itineraries for user ${backendUserId}`);
        return userItineraries;
      }
    } catch (error) {
      console.error('Failed to get user itineraries:', error);
      throw error;
    }
  }

  // Get itinerary by ID
  async getItinerary(id: string, token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${id}`, {}, token);
  }

  // Update itinerary
  async updateItinerary(id: string, updates: { title: string }, token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
  }

  // Delete itinerary
  async deleteItinerary(id: string, token?: string | null): Promise<void> {
    return this.request(`/itineraries/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Get itineraries by destination (no auth required)
  async getItinerariesByDestination(destination: string, limit = 20): Promise<Itinerary[]> {
    return this.request(`/itineraries/destination/${encodeURIComponent(destination)}?limit=${limit}`);
  }

  // User preferences
  async getUserPreferences(token?: string | null, clerkUser?: any): Promise<User['preferences'] | null> {
    if (!clerkUser) {
      return null;
    }

    try {
      // Get backend user ID for Clerk user
      const backendUserId = await userService.getBackendUserId(clerkUser, token);
      return this.request(`/users/${backendUserId}/preferences`, {}, token);
    } catch (error) {
      console.warn('Failed to get user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: User['preferences'], token?: string | null, clerkUser?: any): Promise<User['preferences'] | null> {
    if (!clerkUser) {
      throw new Error('No user provided. Please sign in to update preferences.');
    }

    // Get backend user ID for Clerk user
    const backendUserId = await userService.getBackendUserId(clerkUser, token);
    return this.request(`/users/${backendUserId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }, token);
  }

  // Activity management
  async updateActivity(itineraryId: string, dayPlanId: string, activityId: string, updates: Partial<ScheduledActivity>, token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${itineraryId}/days/${dayPlanId}/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, token);
  }

  async removeActivity(itineraryId: string, dayPlanId: string, activityId: string, token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${itineraryId}/days/${dayPlanId}/activities/${activityId}`, {
      method: 'DELETE',
    }, token);
  }

  async reorderActivities(itineraryId: string, dayPlanId: string, activityIds: string[], token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${itineraryId}/days/${dayPlanId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ activityIds }),
    }, token);
  }

  // Weather API
  async getWeatherForecast(destination: string, startDate: string, endDate: string): Promise<WeatherForecast[]> {
    return this.request(`/weather/forecast?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}`);
  }

  // Travel time calculation
  async getTravelTime(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: 'walking' | 'driving' | 'transit' = 'walking'): Promise<TravelTimeResult> {
    return this.request('/travel/time', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, mode }),
    });
  }

  // Activity search and management
  async searchActivities(destination: string, category?: string, limit = 20): Promise<Activity[]> {
    const params = new URLSearchParams({
      destination,
      limit: limit.toString()
    });
    if (category) {
      params.append('category', category);
    }
    return this.request(`/activities/search?${params.toString()}`);
  }

  async searchActivitiesByQuery(query: string, page = 0, size = 20): Promise<{ content: Activity[]; totalElements: number; totalPages: number }> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString()
    });
    return this.request(`/activities/query?${params.toString()}`);
  }

  async getPopularActivities(destination: string, limit = 10): Promise<Activity[]> {
    const params = new URLSearchParams({
      destination,
      limit: limit.toString()
    });
    return this.request(`/activities/popular?${params.toString()}`);
  }

  async getNearbyActivities(lat: number, lng: number, radius = 10, limit = 20): Promise<Activity[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      limit: limit.toString()
    });
    return this.request(`/activities/nearby?${params.toString()}`);
  }

  async addActivityToItinerary(itineraryId: string, dayPlanId: string, activity: Activity, startTime: string, endTime: string, token?: string | null): Promise<Itinerary> {
    return this.request(`/itineraries/${itineraryId}/days/${dayPlanId}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        activity,
        startTime,
        endTime
      }),
    }, token);
  }
}

export const apiService = new ApiService();