"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { nanoid } from "nanoid"
import { auth } from "./auth"
import { db } from "./db"

// Type definitions
type Url = {
  id: string
  shortCode: string
  originalUrl: string
  userId?: string
  clicks: number
  createdAt: string
}

// Generate a short code
function generateShortCode() {
  return nanoid(6)
}

// Shorten a URL
export async function shortenUrl(originalUrl: string) {
  const session = await auth()
  const shortCode = generateShortCode()
  const userId = session?.user?.id

  // Store in database
  const url = await db.url.create({
    data: {
      shortCode,
      originalUrl,
      userId,
      clicks: 0,
    },
  })

  // If not logged in, store the URL ID in a cookie
  if (!userId) {
    const cookieStore = cookies()
    const existingUrlIds = cookieStore.get("guestUrlIds")?.value
    const urlIds = existingUrlIds ? JSON.parse(existingUrlIds) : []

    urlIds.push(url.id)

    cookieStore.set("guestUrlIds", JSON.stringify(urlIds), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/success")

  return url
}

// Get URLs for the current user
export async function getUserUrls(): Promise<Url[]> {
  const session = await auth()

  if (session?.user?.id) {
    // Get URLs for logged in user
    const urls = await db.url.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return urls
  } else {
    // Get URLs for guest user from cookies
    const cookieStore = cookies()
    const urlIds = cookieStore.get("guestUrlIds")?.value

    if (!urlIds) {
      return []
    }

    const parsedUrlIds = JSON.parse(urlIds)

    if (!parsedUrlIds.length) {
      return []
    }

    const urls = await db.url.findMany({
      where: {
        id: {
          in: parsedUrlIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return urls
  }
}

// Get the latest URL (for success page)
export async function getLatestUrl(): Promise<Url | null> {
  const session = await auth()

  if (session?.user?.id) {
    // Get latest URL for logged in user
    const url = await db.url.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return url
  } else {
    // Get latest URL for guest user from cookies
    const cookieStore = cookies()
    const urlIds = cookieStore.get("guestUrlIds")?.value

    if (!urlIds) {
      return null
    }

    const parsedUrlIds = JSON.parse(urlIds)

    if (!parsedUrlIds.length) {
      return null
    }

    const url = await db.url.findFirst({
      where: {
        id: parsedUrlIds[parsedUrlIds.length - 1],
      },
    })

    return url
  }
}

// Get URL by short code
export async function getUrlByShortCode(shortCode: string): Promise<Url | null> {
  const url = await db.url.findUnique({
    where: {
      shortCode,
    },
  })

  return url
}

// Increment URL clicks
export async function incrementUrlClicks(shortCode: string) {
  await db.url.update({
    where: {
      shortCode,
    },
    data: {
      clicks: {
        increment: 1,
      },
    },
  })
}

// Delete URL
export async function deleteUrl(id: string) {
  const session = await auth()

  if (session?.user?.id) {
    // Delete URL for logged in user
    await db.url.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })
  } else {
    // Delete URL for guest user from cookies
    const cookieStore = cookies()
    const urlIds = cookieStore.get("guestUrlIds")?.value

    if (urlIds) {
      const parsedUrlIds = JSON.parse(urlIds)
      const newUrlIds = parsedUrlIds.filter((urlId: string) => urlId !== id)

      cookieStore.set("guestUrlIds", JSON.stringify(newUrlIds), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })

      await db.url.delete({
        where: {
          id,
        },
      })
    }
  }

  revalidatePath("/dashboard")
}

