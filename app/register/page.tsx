"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LinkIcon, RefreshCw } from "lucide-react"
import { authApi } from "@/lib/api"
import { saveAuthData } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Verification code expiration time in seconds
const VERIFICATION_TIMEOUT = 30

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(VERIFICATION_TIMEOUT)
  const [isExpired, setIsExpired] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Countdown timer for verification code
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (showVerification && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer!)
            setIsExpired(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [showVerification, timeRemaining])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call the real registration API
      const response = await authApi.signup(name, email, password)

      // Show verification section and start timer
      setShowVerification(true)
      setTimeRemaining(VERIFICATION_TIMEOUT)
      setIsExpired(false)

      toast({
        title: "Registration initiated",
        description: "Please check your email for a verification code",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)

    try {
      // Call the verification API
      const response = await authApi.verifyCode(email, Number.parseInt(verificationCode))

      // Save auth data
      saveAuthData(response)

      toast({
        title: "Verification successful",
        description: "Your account has been verified!",
        variant: "default"
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      // Call the resend verification API using our API service
      await authApi.verifyCodeAgain(email)

      // Reset timer
      setTimeRemaining(VERIFICATION_TIMEOUT)
      setIsExpired(false)

      toast({
        title: "Verification code resent",
        description: "Please check your email for the new code",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-20 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold">LinkShort</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="mx-auto w-full max-w-md space-y-8 px-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-gray-500">Enter your information to get started</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>Fill in your details to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={showVerification}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={showVerification}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={showVerification}
                  />
                </div>
                {!showVerification && (
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {showVerification && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>Enter the verification code sent to {email}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="code">Verification Code</Label>
                      {!isExpired ? (
                        <span
                          className={`text-sm font-medium ${timeRemaining <= 10 ? "text-red-500" : "text-gray-500"}`}
                        >
                          Code expires in {formatTime(timeRemaining)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-red-500">Code expired</span>
                      )}
                    </div>
                    <Input
                      id="code"
                      placeholder="Enter code (e.g., 1234)"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      disabled={isExpired}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isVerifying || isExpired || !verificationCode}>
                      {isVerifying ? "Verifying..." : "Verify Account"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendCode}
                      disabled={isResending || !isExpired}
                      className={isExpired ? "bg-blue-100" : ""}
                    >
                      {isResending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Resend
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Didn't receive a code? Check your spam folder or click resend when the timer expires.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
