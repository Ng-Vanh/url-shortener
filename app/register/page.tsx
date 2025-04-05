import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, registerUser } from "@/lib/auth"

export default async function RegisterPage() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  async function handleRegister(formData: FormData) {
    "use server"

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return
    }

    await registerUser({ name, email, password })

    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500">Enter your information below to create your account</p>
        </div>
        <div className="grid gap-6">
          <form action={handleRegister}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </div>
          </form>
        </div>
        <div className="px-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-gray-900">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

