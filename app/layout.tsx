import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { LogOut, Menu } from "lucide-react"

import "./globals.css"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { auth, logoutUser } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "URL Shortener",
  description: "A simple URL shortener application",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-6 md:gap-10">
                <Link href="/" className="font-bold text-xl">
                  URL Shortener
                </Link>
                <nav className="hidden md:flex gap-6">
                  <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                    Home
                  </Link>
                  {session?.user ? (
                    <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                      Dashboard
                    </Link>
                  ) : null}
                </nav>
              </div>
              <div className="hidden md:flex gap-4">
                {session?.user ? (
                  <form action={logoutUser}>
                    <Button variant="outline" size="sm" type="submit">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Register</Button>
                    </Link>
                  </>
                )}
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-4 mt-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                      Home
                    </Link>
                    {session?.user ? (
                      <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                        Dashboard
                      </Link>
                    ) : null}
                    {session?.user ? (
                      <form action={logoutUser}>
                        <Button variant="outline" size="sm" type="submit" className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </form>
                    ) : (
                      <>
                        <Link href="/login">
                          <Button variant="outline" size="sm" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button size="sm" className="w-full">
                            Register
                          </Button>
                        </Link>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </header>
          <main className="flex-1 px-4 md:px-6 py-6 md:py-8">{children}</main>
          <footer className="border-t py-6">
            <div className="container flex items-center justify-center">
              <p className="text-sm text-gray-500 md:text-base text-center">
                &copy; {new Date().getFullYear()} URL Shortener. All rights reserved.
              </p>
            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}

