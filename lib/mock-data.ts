// Types
export interface User {
  id: string
  name: string
  email: string
}

export interface ShortenedUrl {
  id: string
  originalUrl: string
  shortUrl: string
  createdAt: string
  clicks: number
}

// Mock data functions
export function getMockUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch (e) {
    return null
  }
}

export function setMockUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function removeMockUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}

export function getMockUrls(): ShortenedUrl[] {
  if (typeof window === "undefined") return []

  const urlsStr = localStorage.getItem("shortenedUrls")
  if (!urlsStr) return []

  try {
    return JSON.parse(urlsStr)
  } catch (e) {
    return []
  }
}

export function setMockUrls(urls: ShortenedUrl[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("shortenedUrls", JSON.stringify(urls))
}

export function addMockUrl(url: ShortenedUrl): ShortenedUrl[] {
  const urls = getMockUrls()
  const updatedUrls = [url, ...urls]
  setMockUrls(updatedUrls)
  return updatedUrls
}

export function deleteMockUrl(id: string): ShortenedUrl[] {
  const urls = getMockUrls()
  const updatedUrls = urls.filter((url) => url.id !== id)
  setMockUrls(updatedUrls)
  return updatedUrls
}

// Generate a random short code
export function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8)
}

// Initialize mock data
export function initializeMockData(): void {
  if (typeof window === "undefined") return

  // Only initialize if data doesn't exist
  if (!localStorage.getItem("shortenedUrls")) {
    const mockUrls: ShortenedUrl[] = [
      {
        id: "1",
        originalUrl: "https://www.example.com/very/long/url/that/needs/to/be/shortened/for/better/sharing",
        shortUrl: "linkshort.io/abc123",
        createdAt: "2023-04-15T10:30:00Z",
        clicks: 145,
      },
      {
        id: "2",
        originalUrl: "https://www.verylongwebsiteaddress.com/article/how-to-create-short-links-for-better-engagement",
        shortUrl: "linkshort.io/def456",
        createdAt: "2023-04-10T14:20:00Z",
        clicks: 89,
      },
      {
        id: "3",
        originalUrl: "https://www.examplestore.com/products/category/electronics/smartphones/latest-model",
        shortUrl: "linkshort.io/ghi789",
        createdAt: "2023-04-05T09:15:00Z",
        clicks: 217,
      },
    ]

    localStorage.setItem("shortenedUrls", JSON.stringify(mockUrls))
  }
}
