import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, loginUser } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  async function handleLogin(formData: FormData) {
    "use server"

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return
    }

    await loginUser({ email, password })

    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-gray-500">Enter your email below to sign in to your account</p>
        </div>
        <div className="grid gap-6">
          <form action={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </div>
        <div className="px-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-gray-900">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

