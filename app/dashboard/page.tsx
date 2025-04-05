"use client"

import { redirect } from "next/navigation"
import { Copy, ExternalLink, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/auth"
import { deleteUrl, getUserUrls, shortenUrl } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const urls = await getUserUrls()

  async function handleShortenUrl(formData: FormData) {
    "use server"

    const url = formData.get("url") as string

    if (!url) {
      return
    }

    await shortenUrl(url)

    redirect("/dashboard")
  }

  async function handleDeleteUrl(formData: FormData) {
    "use server"

    const id = formData.get("id") as string

    if (!id) {
      return
    }

    await deleteUrl(id)

    redirect("/dashboard")
  }

  return (
    <div className="container py-6 md:py-10 px-0">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Short URL</CardTitle>
            <CardDescription>Enter a long URL to create a new short link</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex w-full gap-2" action={handleShortenUrl}>
              <Input
                name="url"
                className="flex-1"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                type="url"
                required
              />
              <Button type="submit">Shorten</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Short URLs</CardTitle>
            <CardDescription>Manage all your shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            {urls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short URL</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell className="font-medium">
                        <a
                          href={`/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:underline"
                        >
                          {url.shortCode} <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{url.originalUrl}</TableCell>
                      <TableCell>{url.clicks}</TableCell>
                      <TableCell>{new Date(url.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/${url.shortCode}`)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy URL</span>
                          </Button>
                          <form action={handleDeleteUrl}>
                            <input type="hidden" name="id" value={url.id} />
                            <Button variant="outline" size="icon" type="submit">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete URL</span>
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">You haven&apos;t created any short URLs yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

