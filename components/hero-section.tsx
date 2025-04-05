import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-4 px-4 md:px-8 lg:px-16 xl:px-24">
      <div className="container md:px-0">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Short Links, Big Impact
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                Create short, memorable links that redirect to your long URLs. Track clicks and manage your links in one
                place.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              alt="URL Shortener Dashboard"
              className="aspect-video overflow-hidden rounded-xl object-cover object-center"
              src="/placeholder.svg?height=400&width=600"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

