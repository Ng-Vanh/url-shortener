import { type NextRequest, NextResponse } from "next/server"
import { getUrlByShortCode, incrementUrlClicks } from "@/lib/actions"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  const shortCode = params.shortCode

  if (!shortCode) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const url = await getUrlByShortCode(shortCode)

  if (!url) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Increment click count
  await incrementUrlClicks(shortCode)

  return NextResponse.redirect(new URL(url.originalUrl))
}

