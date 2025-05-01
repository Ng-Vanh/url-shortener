import { get } from "http"

// Types
export interface User {
  id: string
  name: string
  email: string
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ShortenedUrl {
  id: string
  longUrl: string
  shortUrl: string
  createdAt: string
  clicks: number
}

// Base API URL
const API_BASE_URL = "http://localhost:80"


// Helper function to get auth headers
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  }
}

// Authentication APIs
export const authApi = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to register")
    }

    const json: ApiResponse<AuthResponse> = await res.json()
    return json.data
  },

  signin: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to login")
    }

    const json: ApiResponse<AuthResponse> = await res.json()
    return json.data
  },

  refresh: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    if (!res.ok) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      throw new Error("Session expired. Please login again")
    }

    const json: ApiResponse<AuthResponse> = await res.json()
    return json.data
  },

  verifyCode: async (email: string, code: number): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/auth/verifyCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to verify code")
    }

    const json: ApiResponse<any> = await res.json()
    return json.data
  },
  verifyCodeAgain: async (email: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to resend verification code")
    }

    return response.json()
  },
}

// URL APIs
export const urlApi = {
  createUrl: async (url: string): Promise<ShortenedUrl> => {
    let res = await fetch(`${API_BASE_URL}/url/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
  
    // Nếu token hết hạn, cần refresh và thử lại một lần
    if (res.status === 401) {
      console.warn("Access token expired. Trying to refresh...");
  
      try {
        const newAuth = await authApi.refresh(); // gọi API refresh token
        // Cập nhật token mới vào localStorage
        localStorage.setItem("accessToken", newAuth.accessToken);
        localStorage.setItem("refreshToken", newAuth.refreshToken);
        localStorage.setItem("user", JSON.stringify(newAuth.user));
  
        // Gọi lại createUrl lần nữa với token mới
        res = await fetch(`${API_BASE_URL}/url/create`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ url }),
        });
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        throw refreshErr;
      }
    }
  
    // Nếu vẫn lỗi
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create shortened URL");
    }
  
    const json: ApiResponse<ShortenedUrl[]> = await res.json();
    return json.data[0];
  },
  

  createCustomUrl: async (url: string, customizedEnpoint: string): Promise<ShortenedUrl> => {
    const res = await fetch(`${API_BASE_URL}/url/alias`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ url, customizedEnpoint }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to create custom URL")
    }

    const json: ApiResponse<ShortenedUrl> = await res.json()
    return json.data
  },

  getUrl: async (name: string): Promise<ShortenedUrl> => {
    const res = await fetch(`${API_BASE_URL}/url/${name}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to get URL details")
    }

    const json: ApiResponse<ShortenedUrl> = await res.json()
    return json.data
  },

  getAllUrls: async (page = 1, pageSize = 10): Promise<ShortenedUrl[]> => {
    const res = await fetch(`${API_BASE_URL}/url/history?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
  
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Failed to get URLs")
    }
  
    const json: ApiResponse<ShortenedUrl[]> = await res.json()
    return json.data
  },
  
  // Resend verification code
 
}
