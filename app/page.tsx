"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, DollarSign, AlertCircle, Receipt } from "lucide-react"
import { dashboardService } from "@/lib/dataService"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    totalRevenue: 0,
    pendingFees: 0,
    totalExpenses: 0
  })
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [upcomingDues, setUpcomingDues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load statistics
        const dashboardStats = await dashboardService.getStats()
        setStats(dashboardStats)

        // Load recent payments
        const recent = await dashboardService.getRecentPayments(5)
        setRecentPayments(recent)

        // Load upcoming dues
        const dues = await dashboardService.getUpcomingDues()
        setUpcomingDues(dues)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      description: "Active students",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600",
    },
    {
      title: "Total Batches",
      value: stats.totalBatches.toString(),
      description: "Active batches",
      icon: GraduationCap,
      trend: "+3",
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      trend: "+8%",
      color: "text-purple-600",
    },
    {
      title: "Pending Fees",
      value: `Rs. ${stats.pendingFees.toLocaleString()}`,
      description: "Outstanding amount",
      icon: AlertCircle,
      trend: "-5%",
      color: "text-red-600",
    },
    {
      title: "Total Expenses",
      value: `Rs. ${stats.totalExpenses.toLocaleString()}`,
      description: "All time expenses",
      icon: Receipt,
      trend: "Tracked",
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to The Universal Academy fees management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
                <span className={`ml-2 ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest fee payments received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">{payment.batch}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">Rs. {payment.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="default"
                          className="text-xs"
                        >
                          paid
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Dues */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Dues</CardTitle>
            <CardDescription>Fees due this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDues.length > 0 ? (
                upcomingDues.map((due, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{due.batch}</p>
                      <p className="text-xs text-muted-foreground">{due.students} students</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">Rs. {due.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Due: {due.dueDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming dues</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Add New Student</p>
                <p className="text-sm text-muted-foreground">Register a new student</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Create Batch</p>
                <p className="text-sm text-muted-foreground">Add a new class batch</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Collect Fees</p>
                <p className="text-sm text-muted-foreground">Mark fee payments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
