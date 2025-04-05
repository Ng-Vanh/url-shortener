"use client"

import Link from "next/link"
import { CheckCircle, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getLatestUrl } from "@/lib/actions"

export default async function SuccessPage() {
  const url = await getLatestUrl()

  if (!url) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader>
            <CardTitle>No URL Found</CardTitle>
            <CardDescription>We couldn&apos;t find your shortened URL. Try creating a new one.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${url.shortCode}`

  return (
    <div className="container flex min-h-[calc(100vh-13rem)] items-center justify-center px-0">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-center">URL Shortened Successfully!</CardTitle>
          <CardDescription className="text-center">
            Your long URL has been shortened and is ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Original URL:</p>
            <p className="rounded-md bg-primary/5 p-2 text-sm break-all">{url.originalUrl}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Short URL:</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 rounded-md bg-primary/5 p-2 text-sm font-medium">{shortUrl}</p>
              <Button
                variant="outline"
                size="icon"
                className="border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  navigator.clipboard.writeText(shortUrl)
                }}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy URL</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
              Create Another
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full">Create Account to Save URLs</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

