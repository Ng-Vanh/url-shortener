"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LinkIcon } from "lucide-react"
import { authApi } from "@/lib/api"
import { saveAuthData } from "@/lib/auth"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email missing",
        description: "Please go back to the registration page",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Call the verification API
      const response = await authApi.verifyCode(email, Number.parseInt(verificationCode))

      // Save auth data
      saveAuthData(response)

      toast({
        title: "Verification successful",
        description: "Your account has been verified!",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-20 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold">LinkShort</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-md space-y-8 px-6 py-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Verify your email</h1>
            <p className="text-gray-500">Enter the verification code sent to your email</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <div className="text-center text-sm">
            Didn&apos;t receive a code?{" "}
            <Link href="/register" className="font-medium underline underline-offset-4">
              Go back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
