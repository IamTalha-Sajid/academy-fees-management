"use client"

import { GraduationCap, LayoutDashboard, Users, DollarSign, FileText, BookOpen, Receipt, LogOut, User, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
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
  const { showFeesAndIncome } = useSettings()

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-700">
      <SidebarHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <GraduationCap className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">The Universal Academy</h1>
            <p className="text-xs text-slate-400">Fees Management System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 font-semibold px-4 py-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {menuItems.filter(item => {
                // Hide fees-related menu items when fees are disabled
                if (!showFeesAndIncome) {
                  return !['Fee Collection', 'Expense Tracking', 'Reports'].includes(item.title)
                }
                return true
              }).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-600 transition-all duration-200">
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-700 bg-slate-800">
        <div className="p-4 space-y-3">
          {admin && (
            <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <User className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{admin.username}</p>
                <p className="text-xs text-slate-400 capitalize">{admin.role}</p>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white hover:border-slate-500 transition-all duration-200" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <p className="text-xs text-slate-500 text-center">© 2024 The Universal Academy</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
