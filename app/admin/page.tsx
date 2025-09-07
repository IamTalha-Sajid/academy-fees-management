"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Calendar, Plus, Sparkles, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import PageProtection from "@/components/PageProtection"
import { useSettings } from "@/contexts/SettingsContext"

interface Admin {
  id: string
  username: string
  role: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { showFeesAndIncome, toggleFeesAndIncome } = useSettings()

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Error loading admins:', error)
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultAdmin = async () => {
    try {
      const response = await fetch('/api/auth/init', {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Default admin initialized successfully",
        })
        await loadAdmins()
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize default admin",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error initializing admin:', error)
      toast({
        title: "Error",
        description: "Failed to initialize default admin",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 bg-slate-900 min-h-screen p-6">
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-red-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Admin Management
          </h1>
          <p className="text-slate-400 mt-2">Loading admin data...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <Shield className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Admin Management
            </h1>
            <p className="text-slate-400 mt-2">Loading admin data...</p>
          </div>
        </div>
      </PageProtection>
    )
  }

  return (
    <PageProtection>
      <div className="space-y-8 bg-slate-900 min-h-screen p-6">
        {/* Enhanced Dark Mode Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 text-white border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
                    Admin Management
                    <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                  </h1>
                  <p className="text-slate-300 mt-1">Manage system administrators</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Fees Visibility Toggle */}
                <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center gap-2">
                    {showFeesAndIncome ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-400" />
                    )}
                    <Label htmlFor="fees-toggle" className="text-slate-300 text-sm font-medium">
                      Show Fees & Income
                    </Label>
                  </div>
                  <Switch
                    id="fees-toggle"
                    checked={showFeesAndIncome}
                    onCheckedChange={toggleFeesAndIncome}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
                <Button 
                  onClick={initializeDefaultAdmin}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Initialize Default Admin
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dark Mode Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Admins</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <User className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{admins.length}</div>
              <p className="text-xs text-slate-400 mt-1">System administrators</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Admins</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {admins.filter(admin => admin.isActive).length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently active</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Super Admins</CardTitle>
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {admins.filter(admin => admin.role === 'super_admin').length}
              </div>
              <p className="text-xs text-slate-400 mt-1">Super administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Dark Mode Admin Table */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              Admin Users
            </CardTitle>
            <CardDescription className="text-slate-300">List of all system administrators</CardDescription>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-4">No admin users found</p>
                <p className="text-sm text-slate-400">
                  Click "Initialize Default Admin" to create the first admin user
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 font-semibold">Username</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Role</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Last Login</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow 
                        key={admin.id}
                        className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-white">{admin.username}</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              admin.role === 'super_admin' 
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300" 
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300"
                            } font-medium transition-colors duration-200`}
                          >
                            {admin.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              admin.isActive 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                                : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                            } font-medium transition-colors duration-200`}
                          >
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.lastLogin ? (
                            <div className="flex items-center gap-1 text-white">
                              <Calendar className="h-4 w-4 text-blue-400" />
                              {new Date(admin.lastLogin).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-slate-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-white">
                            <Calendar className="h-4 w-4 text-green-400" />
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageProtection>
  )
}
