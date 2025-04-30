"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Check, Copy, LinkIcon, LogOut, Plus, User } from "lucide-react"

import { urlApi, type ShortenedUrl } from "@/lib/api"
import { clearAuthData, getCurrentUser, withAuth } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function DashboardPage() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([])
  const [longUrl, setLongUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [isCustomAlias, setIsCustomAlias] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUrls, setIsLoadingUrls] = useState(true)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [recentlyCreatedUrl, setRecentlyCreatedUrl] = useState<ShortenedUrl | null>(null)
  const [copied, setCopied] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Check if user is logged in and fetch URLs
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser()
      console.log(currentUser)
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      try {
        setIsLoadingUrls(true)
        // Fetch user's URLs
        const urlsData = await withAuth(() => urlApi.getAllUrls())
        setUrls(urlsData)
      } catch (error) {
        toast({
          title: "Failed to load URLs",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUrls(false)
      }
    }

    checkAuth()
  }, [router, toast])

  const handleLogout = () => {
    clearAuthData()
    router.push("/")
  }

  const handleShortenUrl = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!longUrl) return

    setIsLoading(true)

    try {
      let response

      if (isCustomAlias && customAlias) {
        // Create custom URL
        response = await withAuth(() => urlApi.createCustomUrl(longUrl, customAlias))
      } else {
        // Create regular shortened URL
        response = await withAuth(() => urlApi.createUrl(longUrl))
      }

      setRecentlyCreatedUrl(response)
      // Add the new URL to the list
      setUrls([response, ...urls])


      // Reset form
      setLongUrl("")
      setCustomAlias("")
      setIsCustomAlias(false)
      setShowCustomDialog(false)

      toast({
        title: "URL shortened successfully",
        description: `Your short URL: ${response.shortUrl}`,
      })
    } catch (error) {
      toast({
        title: "Failed to shorten URL",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)

    if (recentlyCreatedUrl && recentlyCreatedUrl.shortUrl === url) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    toast({
      title: "URL copied to clipboard",
      description: url,
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
            <form onSubmit={handleShortenUrl} className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="Paste your long URL"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" onClick={() => setShowCustomDialog(true)}>
                  Custom
                </Button>
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
              </div>

              {/* Recently created URL section */}
              {recentlyCreatedUrl && (
                <Alert className="bg-white border-blue-200 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Your new shortened URL</p>
                      <AlertDescription className="font-medium text-blue-600 break-all">
                        {recentlyCreatedUrl.shortUrl}
                      </AlertDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 min-w-[80px]"
                      onClick={() => handleCopyUrl(recentlyCreatedUrl.shortUrl)}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </Alert>
              )}
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

            {isLoadingUrls ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : urls.length > 0 ? (
              <div className="rounded-md border p-1">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Created</TableHead>
                      {/* <TableHead>Clicks</TableHead> */}
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urls.map((url) => (
                      <TableRow key={url.id}>
                        <TableCell className="max-w-[200px] truncate" title={url.longUrl}>
                          {url.longUrl}
                        </TableCell>
                        <TableCell>{url.shortUrl}</TableCell>
                        <TableCell>{formatDate(url.createdAt)}</TableCell>
                        {/* <TableCell>{url.clicks}</TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(url.shortUrl)}>
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
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

      {/* Custom Alias Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom URL</DialogTitle>
            <DialogDescription>Enter a custom alias for your shortened URL</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="longUrl">Original URL</Label>
              <Input
                id="longUrl"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customAlias">Custom Alias</Label>
              <Input
                id="customAlias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-custom-link"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsCustomAlias(true)
                handleShortenUrl(new Event("submit") as any)
              }}
              disabled={isLoading || !longUrl || !customAlias}
            >
              {isLoading ? "Creating..." : "Create Custom URL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
