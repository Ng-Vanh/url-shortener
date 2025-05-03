import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster" // 🔥 import Toaster

export const metadata: Metadata = {
  title: "Short Url",
  description: "Rut gon link naooo",
  generator: "By Vanh",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster /> {/* 👈 Thêm Toaster ở đây */}
      </body>
    </html>
  )
}
