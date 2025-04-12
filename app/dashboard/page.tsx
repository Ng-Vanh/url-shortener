"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Copy, LinkIcon, LogOut, Plus, Trash2, User } from "lucide-react"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortUrl: string
  createdAt: string
  clicks: number
}

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

export default function DashboardPage() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([])
  const [longUrl, setLongUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userStr))

    const savedUrls = localStorage.getItem("shortenedUrls")
    if (savedUrls) {
      setUrls(JSON.parse(savedUrls))
    } else {
      setUrls(mockUrls)
      localStorage.setItem("shortenedUrls", JSON.stringify(mockUrls))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!longUrl) return

    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate a random short code
      const shortCode = Math.random().toString(36).substring(2, 8)

      const newUrl: ShortenedUrl = {
        id: Date.now().toString(),
        originalUrl: longUrl,
        shortUrl: `linkshort.io/${shortCode}`,
        createdAt: new Date().toISOString(),
        clicks: 0,
      }

      const updatedUrls = [newUrl, ...urls]
      setUrls(updatedUrls)
      localStorage.setItem("shortenedUrls", JSON.stringify(updatedUrls))

      setLongUrl("")

      toast({
        title: "URL shortened successfully",
        description: `Your short URL: linkshort.io/${shortCode}`,
      })
    } catch (error) {
      toast({
        title: "Failed to shorten URL",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copied to clipboard",
      description: url,
    })
  }

  const handleDeleteUrl = (id: string) => {
    const updatedUrls = urls.filter((url) => url.id !== id)
    setUrls(updatedUrls)
    localStorage.setItem("shortenedUrls", JSON.stringify(updatedUrls))

    toast({
      title: "URL deleted",
      description: "The shortened URL has been removed",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">LinkShort</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-10">
        <div className="container space-y-8 px-6">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Manage your shortened URLs</p>
          </div>

          <div className="rounded-lg border p-6 bg-blue-50">
            <h2 className="text-xl font-bold mb-4">Create new short link</h2>
            <form onSubmit={handleShortenUrl} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="Paste your long URL"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Shortening..."
                ) : (
                  <>
                    Shorten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your links</h2>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {urls.length > 0 ? (
              <div className="rounded-md border p-1">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urls.map((url) => (
                      <TableRow key={url.id}>
                        <TableCell className="max-w-[200px] truncate" title={url.originalUrl}>
                          {url.originalUrl}
                        </TableCell>
                        <TableCell>{url.shortUrl}</TableCell>
                        <TableCell>{formatDate(url.createdAt)}</TableCell>
                        <TableCell>{url.clicks}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(url.shortUrl)}>
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUrl(url.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <LinkIcon className="h-10 w-10 text-blue-400" />
                  <h3 className="mt-4 text-lg font-semibold">No links yet</h3>
                  <p className="mb-4 mt-2 text-sm text-gray-500">
                    You haven't created any shortened links yet. Use the form above to create your first one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row px-6">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} LinkShort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
