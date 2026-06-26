import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { UserProfile, AuthResponse } from './types';

// Helper to determine the backend base URL dynamically
const getBackendUrl = () => {
  // Web fallback
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // Retrieve Host URI from Expo config to resolve local IP for physical devices
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000`;
  }

  // Emulator fallbacks
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000' // Android Emulator loopback
    : 'http://localhost:5000'; // iOS Simulator (localhost works)
};

export const BASE_URL = getBackendUrl();

export const authService = {
  /**
   * Register a new user credentials
   */
  async signup(payload: {
    emailOrPhone: string;
    password: string;
    fullName: string;
    username: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    return data;
  },

  /**
   * Login with identifier (email/phone/username) and password
   */
  async login(payload: {
    identifier: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  /**
   * Update onboarding interests and role profile info
   */
  async saveOnboarding(payload: {
    username: string;
    interests: string[];
    role: string;
  }): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/api/user/onboarding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save onboarding details');
    }
    return data;
  },

  /**
   * Retrieve profile and onboarding interests
   */
  async getProfile(username: string): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/api/user/profile/${username}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile details');
    }
    return data;
  },
};
