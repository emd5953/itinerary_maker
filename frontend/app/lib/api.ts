import { useAuth } from '@clerk/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class ApiService {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // User Profile Methods
  static async getUserProfile(token: string) {
    return this.request('/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static async updateUserPreferences(token: string, preferences: any) {
    return this.request('/user/preferences', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  }

  // Health Check
  static async healthCheck() {
    return this.request('/health');
  }
}

// Custom hook for authenticated API calls
export function useApiService() {
  const { getToken } = useAuth();

  const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    return ApiService.request(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  return {
    getUserProfile: () => authenticatedRequest('/user/profile'),
    updateUserPreferences: (preferences: any) => 
      authenticatedRequest('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      }),
    healthCheck: () => ApiService.healthCheck(),
  };
}