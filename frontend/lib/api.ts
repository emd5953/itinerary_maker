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
}

export const apiService = new ApiService();