"use server"

import { cookies } from "next/headers"

// Mock session data for demo purposes
// In a real app, you would use a proper auth provider like NextAuth.js or Clerk

type User = {
  id: string
  name: string
  email: string
}

type Session = {
  user: User
}

// Mock user database
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
]

// Get current session
export async function auth(): Promise<Session | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const userId = sessionCookie.value
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return null
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  } catch (error) {
    return null
  }
}

// Register a new user
export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  // In a real app, you would hash the password and store in a database
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
  }

  users.push(newUser)

  // Set session cookie
  const cookieStore = cookies()
  cookieStore.set("session", newUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  }
}

// Login a user
export async function loginUser({
  email,
  password,
}: {
  email: string
  password: string
}) {
  // In a real app, you would verify the password hash
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Set session cookie
  const cookieStore = cookies()
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

// Logout a user
export async function logoutUser() {
  const cookieStore = cookies()
  cookieStore.delete("session")
}

