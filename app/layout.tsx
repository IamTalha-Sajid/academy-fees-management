import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { SettingsProvider } from "@/contexts/SettingsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Universal Academy - Fees Management",
  description: "Admin dashboard for managing student fees and batches",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <AuthProvider>
          <SettingsProvider>
            <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-slate-900">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 px-4 bg-slate-800">
                <SidebarTrigger className="-ml-1 text-slate-300 hover:text-white hover:bg-slate-700" />
                <Separator orientation="vertical" className="mr-2 h-4 bg-slate-600" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/" className="text-slate-300 hover:text-white">The Universal Academy</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block text-slate-500" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-white">Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4 bg-slate-900">{children}</div>
            </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
