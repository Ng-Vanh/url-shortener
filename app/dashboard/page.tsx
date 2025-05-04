"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, LinkIcon, LogOut, Plus, User, Trash2, AlertCircle } from "lucide-react"

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

const ROWS_PER_PAGE = 5


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
  const [currentPage, setCurrentPage] = useState(1)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [urlToDelete, setUrlToDelete] = useState<ShortenedUrl | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [totalUrls, setTotalUrls] = useState(0)
  const [totalPages, setTotalPages] = useState(1)


  const router = useRouter()
  const { toast } = useToast()
  // const totalPages = Math.max(1, Math.ceil(urls.length / ROWS_PER_PAGE))

  const SHORT_BASE_URL = "http://localhost:80/url/" // Replace with your actual base URL

  const fetchUrls = async (page: number) => {
    const url = `http://localhost/url/history?page=${page}&pageSize=${ROWS_PER_PAGE}`
  
    const authFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      let res = await fetch(input, init)
  
      if (res.status === 401) {
        try {
          const refreshRes = await fetch("http://localhost/auth/refresh", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
            },
          })
  
          if (!refreshRes.ok) throw new Error("Refresh failed")
  
          const data = await refreshRes.json()
  
          localStorage.setItem("accessToken", data.data.accessToken)
          localStorage.setItem("refreshToken", data.data.refreshToken)
          localStorage.setItem("user", JSON.stringify(data.data.user))
  
          const retryInit = {
            ...init,
            headers: {
              ...(init?.headers || {}),
              Authorization: `Bearer ${data.data.accessToken}`,
            },
          }
  
          res = await fetch(input, retryInit)
        } catch (err) {
          localStorage.clear()
          throw new Error("Session expired. Please login again.")
        }
      }
  
      return res
    }
  
    try {
      setIsLoadingUrls(true)
  
      const res = await authFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
  
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to get URLs")
      }
  
      const result = await res.json()
      setUrls(result.data.urls)
      setTotalPages(result.data.totalPages)
  
      const lastPageItems =
        result.data.urls.length > 0 && page === result.data.totalPages
          ? result.data.urls.length
          : ROWS_PER_PAGE
  
      const estimatedTotal =
        (result.data.totalPages - 1) * ROWS_PER_PAGE + lastPageItems
  
      setTotalUrls(estimatedTotal)
    } catch (error) {
      toast({
        title: "Failed to load URLs",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUrls(false)
    }
  }
  

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

     	
      fetchUrls(currentPage)
    }

    checkAuth()
  }, [router, toast])

  useEffect(() => {
    if (user) {
      fetchUrls(currentPage)
    }
  }, [currentPage])
  const handleLogout = () => {
    clearAuthData()
    router.push("/")
  }


  const handleShortenUrl = async (
    e?: React.FormEvent,
    options?: { useCustomAlias?: boolean; customAlias?: string }
  ) => {
    if (e) e.preventDefault()
    if (!longUrl) return
  
    setIsLoading(true)
  
    try {
      let response: ShortenedUrl
  
      const useCustom = options?.useCustomAlias && options.customAlias
  
      if (useCustom) {
        response = await withAuth(() => urlApi.createCustomUrl(longUrl, options!.customAlias!))
      } else {
        response = await withAuth(() => urlApi.createUrl(longUrl))
      }
  
      setRecentlyCreatedUrl(response)
      setUrls([response, ...urls])
      setLongUrl("")
      setCustomAlias("")
      setIsCustomAlias(false)
      setShowCustomDialog(false)
  
      toast({
        title: "URL shortened successfully",
        description: `Your short URL: ${SHORT_BASE_URL + response.shortUrl}`,
        variant: "default",
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
  
  
  
  const handleDeleteClick = (url: ShortenedUrl) => {
    setUrlToDelete(url)
    console.log(url._id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!urlToDelete) return

    setIsDeleting(true)
    console.log(urlToDelete._id)

    try {
      // Call the delete API
      await withAuth(() => urlApi.deleteUrl(urlToDelete._id))

      // Update our estimate of total URLs
      setTotalUrls((prev) => Math.max(0, prev - 1))

      // If we deleted the last item on the current page and it's not page 1,
      // go to the previous page
      if (urls.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      } else {
        // Otherwise, refetch the current page
        fetchUrls(currentPage)
      }

      toast({
        title: "URL deleted successfully",
        description: "The shortened URL has been removed",
      })

      // Close the dialog
      setShowDeleteDialog(false)
      setUrlToDelete(null)
    } catch (error) {
      toast({
        title: "Failed to delete URL",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
      description: SHORT_BASE_URL+url,
      variant: "default"
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }


  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Add visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()


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
                        {SHORT_BASE_URL+recentlyCreatedUrl.shortUrl}
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
              <div className="rounded-md border">
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
                    {urls.map((url)  => (
                      <TableRow key={url._id}>
                        <TableCell className="max-w-[200px] truncate" title={url.longUrl}>
                          {url.longUrl}
                        </TableCell>
                        <TableCell>{ `${SHORT_BASE_URL}${url.shortUrl}`}</TableCell>
                        <TableCell>{formatDate(url.createdAt)}</TableCell>
                        {/* <TableCell>{url.clicks}</TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(`${SHORT_BASE_URL}${url.shortUrl}`)}>
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(url)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 {/* Pagination */}
                 <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                  {/* <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">{totalUrls > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * ROWS_PER_PAGE, totalUrls)}</span> of{" "}
                    <span className="font-medium">{totalUrls}</span> results
                  </div> */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1 || isLoadingUrls}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous</span>
                    </Button>

                    {pageNumbers.map((page, index) =>
                      page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`page-${page}`}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          disabled={isLoadingUrls}
                          className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-500" : ""}`}
                        >
                          {page}
                        </Button>
                      ),
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || isLoadingUrls}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next</span>
                    </Button>
                  </div>
                </div>
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
              onClick={() =>
                handleShortenUrl(undefined, {
                  useCustomAlias: true,
                  customAlias: customAlias.trim(),
                })
              }
              disabled={isLoading || !longUrl || !customAlias}
            >
              {isLoading ? "Creating..." : "Create Custom URL"}
            </Button>

            
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shortened URL? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {urlToDelete && (
            <div className="py-4">
              <div className="rounded-md bg-gray-50 p-3 text-sm">
                <p className="font-medium text-gray-700">Short URL:</p>
                <p className="mt-1 break-all text-gray-600">{SHORT_BASE_URL+urlToDelete.shortUrl}</p>
                <p className="mt-2 font-medium text-gray-700">Original URL:</p>
                <p className="mt-1 break-all text-gray-600">{urlToDelete.longUrl}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete URL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}