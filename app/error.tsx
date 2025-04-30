"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, LinkIcon } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">LinkShort</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-6 py-16 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <div className="absolute -inset-1 rounded-full bg-red-100 blur-lg"></div>
              <div className="relative bg-white rounded-full p-6">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900">Oops!</h1>
            <p className="mt-2 text-xl font-semibold text-gray-700">Something went wrong</p>
            <p className="mt-4 text-base text-gray-500 md:text-lg">
              We apologize for the inconvenience. Please try again or return to the home page.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => reset()} size="lg">
                Try again
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/">Go back home</Link>
              </Button>
            </div>
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
