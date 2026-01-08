const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Utility function to format time from HH:mm:ss to HH:mm
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // "10:00:00" -> "10:00"
};

export interface GenerateItineraryRequest {
  destination: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
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

  private async request<T>(endpoint: string, options: RequestInit = {}, token?: string | null): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders(token);

    console.log('Making API request:', { url, method: options.method || 'GET', headers }); // Debug log

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log('API response:', { status: response.status, statusText: response.statusText }); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText); // Debug log
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data); // Debug log
    return data;
  }

  // Health check (no auth required)
  async healthCheck(): Promise<{ status: string; database: string; redis: string }> {
    return this.request('/health');
  }

  // Generate itinerary
  async generateItinerary(request: GenerateItineraryRequest, token?: string | null): Promise<Itinerary> {
    return this.request('/itineraries/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    }, token);
  }

  // Get user's itineraries
  async getMyItineraries(token?: string | null): Promise<Itinerary[]> {
    return this.request('/itineraries/my', {}, token);
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
  async getUserPreferences(token?: string | null): Promise<User['preferences']> {
    return this.request('/user/preferences', {}, token);
  }

  async updateUserPreferences(preferences: User['preferences'], token?: string | null): Promise<User['preferences']> {
    return this.request('/user/preferences', {
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