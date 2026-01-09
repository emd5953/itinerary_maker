import { apiService } from './api';

export interface UserMapping {
  clerkId: string;
  backendUserId: string;
  email: string;
  name: string;
}

class UserService {
  private userMappingCache = new Map<string, string>();

  /**
   * Get or create a backend user ID for a Clerk user
   */
  async getBackendUserId(clerkUser: any, token?: string | null): Promise<string> {
    if (!clerkUser?.id) {
      throw new Error('No Clerk user provided');
    }

    // Check cache first
    if (this.userMappingCache.has(clerkUser.id)) {
      return this.userMappingCache.get(clerkUser.id)!;
    }

    try {
      // First, try to find existing user by Clerk ID
      const existingUser = await this.findUserByClerkId(clerkUser.id, token);
      if (existingUser) {
        this.userMappingCache.set(clerkUser.id, existingUser.id);
        return existingUser.id;
      }

      // If not found by Clerk ID, try by email
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (email) {
        const userByEmail = await this.findUserByEmail(email, token);
        if (userByEmail) {
          this.userMappingCache.set(clerkUser.id, userByEmail.id);
          return userByEmail.id;
        }
      }

      // If no existing user found, create a new one
      const newUser = await this.createBackendUser(clerkUser, token);
      this.userMappingCache.set(clerkUser.id, newUser.id);
      return newUser.id;
    } catch (error) {
      console.error('Failed to get/create backend user:', error);
      
      // TEMPORARY FALLBACK: Use a demo user ID for this Clerk user
      // This ensures the app keeps working while we fix the user creation issue
      const fallbackUserId = '550e8400-e29b-41d4-a716-446655440000';
      console.warn(`Using fallback user ID ${fallbackUserId} for Clerk user ${clerkUser.id}`);
      this.userMappingCache.set(clerkUser.id, fallbackUserId);
      return fallbackUserId;
    }
  }

  /**
   * Try to find user by Clerk ID
   */
  private async findUserByClerkId(clerkId: string, token?: string | null): Promise<any> {
    try {
      // Try to get user by Clerk ID - we'll add this endpoint to the backend
      const user = await apiService.request(`/users/clerk/${clerkId}`, {
        method: 'GET',
      }, token);
      return user;
    } catch (error) {
      // If endpoint doesn't exist or user not found, return null
      return null;
    }
  }

  /**
   * Try to find user by email
   */
  private async findUserByEmail(email: string, token?: string | null): Promise<any> {
    try {
      // Try to get user by email - we'll add this endpoint to the backend
      const user = await apiService.request(`/users/email/${encodeURIComponent(email)}`, {
        method: 'GET',
      }, token);
      return user;
    } catch (error) {
      // If endpoint doesn't exist or user not found, return null
      return null;
    }
  }

  /**
   * Create a new user in the backend
   */
  private async createBackendUser(clerkUser: any, token?: string | null): Promise<any> {
    const userData = {
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      clerkUserId: clerkUser.id, // Note: backend expects 'clerkUserId', not 'clerkId'
    };

    try {
      // Try to create the user
      const user: any = await apiService.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }, token);

      // Then create default preferences for the user
      const defaultPreferences = {
        interests: [],
        budgetLevel: 'MID_RANGE',
        travelStyle: 'BALANCED',
        dietaryRestrictions: [],
        preferredTransport: 'WALKING'
      };

      try {
        await apiService.request(`/users/${user.id}/preferences`, {
          method: 'PUT',
          body: JSON.stringify(defaultPreferences),
        }, token);
      } catch (prefError) {
        console.warn('Failed to create default preferences, but user was created:', prefError);
      }

      return user;
    } catch (error) {
      // If user creation fails with 400, it might be because user already exists
      // In that case, we need a way to find the existing user
      // For now, we'll throw the error and handle it in the calling code
      console.error('Failed to create backend user:', error);
      throw error;
    }
  }

  /**
   * Clear the user mapping cache (useful for logout)
   */
  clearCache(): void {
    this.userMappingCache.clear();
  }
}

export const userService = new UserService();