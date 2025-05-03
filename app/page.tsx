"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Copy, LinkIcon, LogOut, User } from "lucide-react"
import { urlApi } from "@/lib/api"
import { isAuthenticated, withAuth, getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
export default function Home() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const { toast } = useToast()
  useEffect(() => {
    // Check authentication status
    const currentUser = getCurrentUser()
    setUser(currentUser)

    
  }, [])
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")

    // Update state
    setUser(null)

    // Show toast
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "default"
    })
  }
  return (
    <div className="flex flex-col min-h-screen">
     <header className="border-b">
  <div className="container flex h-20 items-center justify-between px-6">
    {/* Logo + Dashboard */}
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-6 w-6 text-blue-500" />
        <span className="text-xl font-bold">LinkShort</span>
      </div>
      
      {/* Chỉ hiện Dashboard nếu đã đăng nhập */}
      {user && (
        <Link href="/dashboard">
          <Button variant="ghost" className="text-xl font-bold">Dashboard</Button>
        </Link>
      )}
    </div>

    {/* Phần nav bên phải */}
    <nav className="flex gap-4 items-center">
      {user ? (
        <>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </>
      )}
    </nav>
  </div>
</header>

      <main className="flex-1">
        <section className="min-h-screen py-28 md:py-36 lg:py-44 bg-gradient-to-b from-white to-blue-100">
          <div className="container px-6 md:px-8">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Shorten, share, and track your links
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Create short links, QR Codes, and Link-in-bio pages. Share them anywhere. Track what's working, and
                  what's not. Please login to use our service.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <form className="flex w-full max-w-md flex-col gap-2">
                  <div className="flex w-full items-center space-x-2">
                    {/* <Input type="url" placeholder="Paste your long URL" className="flex-1" required />
                    <Button type="submit">
                      Shorten
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}
                    <Link href="/login" className="w-full flex justify-center">
                    {!user && (
                    <Button
                      variant="outline"
                      className="transition duration-300 ease-in-out border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg text-lg shadow-md"
                    >
                      Click here to Login
                    </Button>)}
                  </Link>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container px-6 md:px-8">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Track your link performance</h2>
                  <p className="text-gray-500 md:text-xl">
                    Get detailed insights on who's clicking your links, when, and where from.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-10">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Link Statistics</h3>
                    <p className="text-sm text-gray-500">Track clicks, locations, and devices</p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Clicks</p>
                        <p className="text-2xl font-bold">1,234</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Mobile</p>
                          <p className="text-xl font-bold">65%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Desktop</p>
                          <p className="text-xl font-bold">35%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 md:py-6">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-gray-500 text-center">&copy; {new Date().getFullYear()} LinkShort. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6 text-center">
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Terms
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </div>

      </footer>
    </div>
  )
}
