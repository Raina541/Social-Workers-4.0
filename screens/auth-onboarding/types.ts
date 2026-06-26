export interface UserProfile {
  id: string;
  emailOrPhone: string;
  fullName: string;
  username: string;
  interests: string[];
  role: string;
  createdAt: string;
}

export interface AuthResponse extends UserProfile {}

export interface ApiError {
  error: string;
}
