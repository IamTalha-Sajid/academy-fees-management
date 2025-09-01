"use client"

import { GraduationCap, LayoutDashboard, Users, DollarSign, FileText, BookOpen, Receipt, LogOut, User, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

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
  {
    title: "Admin Management",
    url: "/admin",
    icon: Shield,
  },
]

export function AppSidebar() {
  const { admin, logout } = useAuth()

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
        <div className="p-4 space-y-3">
          {admin && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{admin.role}</p>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <p className="text-xs text-muted-foreground text-center">© 2024 The Universal Academy</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
