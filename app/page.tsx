import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { shortenUrl } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { HeroSection } from "@/components/hero-section"
import { Features } from "@/components/features"

export default async function Home() {
  const session = await auth()

  async function handleShortenUrl(formData: FormData) {
    "use server"

    const url = formData.get("url") as string

    if (!url) {
      return
    }

    await shortenUrl(url)

    if (session?.user) {
      redirect("/dashboard")
    } else {
      redirect("/success")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container md:px-0">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Shorten Your URL</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Paste your long URL below and get a short link instantly.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <form className="flex w-full max-w-md flex-col gap-2 sm:flex-row" action={handleShortenUrl}>
                  <Input
                    name="url"
                    className="flex-1"
                    placeholder="https://example.com/very/long/url/that/needs/shortening"
                    type="url"
                    required
                  />
                  <Button type="submit" className="sm:w-auto">
                    Shorten <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500">
                  By using our service you accept our{" "}
                  <Link href="/terms" className="underline underline-offset-2">
                    Terms of Service
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <Features />
      </main>
    </div>
  )
}

