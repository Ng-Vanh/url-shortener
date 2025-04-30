import { authApi, type AuthResponse } from "./api"

// Save auth data to localStorage
export const saveAuthData = (data: AuthResponse) => {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  } else {
    localStorage.removeItem("user");
  }
};


// Clear auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  
  console.log(localStorage.getItem("accessToken"))
  return !!localStorage.getItem("accessToken")
}

// Refresh token if needed
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    const response = await authApi.refresh()
    saveAuthData(response)
    return true
  } catch (error) {
    clearAuthData()
    return false
  }
}

// Wrapper for API calls that need authentication\
export const withAuth = async <T>(apiCall: () => Promise<T>)
: Promise<T> =>
{
  try {
    return await apiCall();
  } catch (error) {
    // If the error is due to an expired token, try to refresh
    if (error instanceof Error && error.message.includes("401")) {
      const refreshed = await refreshTokenIfNeeded()
      if (refreshed) {
        // Retry the API call with the new token
        return await apiCall();
      }
    }
    throw error
  }
}
