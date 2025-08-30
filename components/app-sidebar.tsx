"use client"

import { GraduationCap, LayoutDashboard, Users, DollarSign, FileText, BookOpen, Receipt } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Batch Management",
    url: "/batches",
    icon: BookOpen,
  },
  {
    title: "Student Management",
    url: "/students",
    icon: Users,
  },
  {
    title: "Teacher Management",
    url: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Fee Collection",
    url: "/fees",
    icon: DollarSign,
  },
  {
    title: "Expense Tracking",
    url: "/expenses",
    icon: Receipt,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg">The Universal Academy</h1>
            <p className="text-xs text-muted-foreground">Fees Management System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <p className="text-xs text-muted-foreground">© 2024 The Universal Academy</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
