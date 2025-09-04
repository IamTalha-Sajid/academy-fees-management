"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, AlertCircle, Receipt, BookOpen, FileText, TrendingUp, TrendingDown, ArrowUpRight, Sparkles, Activity } from "lucide-react"
import { dashboardService } from "@/lib/dataService"
import { useRouter } from "next/navigation"
import PageProtection from "@/components/PageProtection"

export default function Dashboard() {
  const router = useRouter()
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
      trendIcon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trendColor: "text-green-600",
    },
    {
      title: "Total Batches",
      value: stats.totalBatches.toString(),
      description: "Active batches",
      icon: GraduationCap,
      trend: "+3",
      trendIcon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trendColor: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      description: "This month",
      icon: () => <span className="text-lg font-bold text-purple-600">Rs</span>,
      trend: "+8%",
      trendIcon: TrendingUp,
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trendColor: "text-green-600",
    },
    {
      title: "Pending Fees",
      value: `Rs. ${stats.pendingFees.toLocaleString()}`,
      description: "Outstanding amount",
      icon: AlertCircle,
      trend: "-5%",
      trendIcon: TrendingDown,
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trendColor: "text-red-600",
    },
    {
      title: "Total Expenses",
      value: `Rs. ${stats.totalExpenses.toLocaleString()}`,
      description: "All time expenses",
      icon: Receipt,
      trend: "Tracked",
      trendIcon: Activity,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trendColor: "text-blue-600",
    },
  ]

  if (loading) {
    return (
      <PageProtection>
        <div className="space-y-6 bg-slate-900 min-h-screen">
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Loading your academy insights...</p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Sparkles className="w-6 h-6 text-blue-300" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Dashboard</h1>
            </div>
            <p className="text-slate-300 text-lg mb-6">Welcome to The Universal Academy fees management system</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-slate-200">Live Updates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">Growth Tracking</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Enhanced Dark Mode Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {statsData.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800 to-slate-900 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-300">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{stat.description}</p>
                  <div className={`flex items-center gap-1 ${stat.trendColor}`}>
                    <stat.trendIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{stat.trend}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, (index + 1) * 20)}%` }}
                  ></div>
                </div>
              </CardContent>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Enhanced Dark Mode Recent Payments */}
          <Card className="border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                  <span className="text-green-400 font-bold text-sm">Rs</span>
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">Recent Payments</CardTitle>
                  <CardDescription className="text-green-400">Latest fee payments received</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.length > 0 ? (
                  recentPayments.map((payment, index) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{payment.studentName}</p>
                        <p className="text-xs text-green-400 font-medium">{payment.batch}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-white">Rs. {payment.amount.toLocaleString()}</p>
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-medium hover:bg-green-500/30 hover:text-green-300 transition-colors duration-200">
                          ✓ Paid
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-500/20 rounded-lg border border-slate-500/30 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-slate-500 font-bold text-lg">Rs</span>
                    </div>
                    <p className="text-sm text-slate-400">No recent payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Dark Mode Upcoming Dues */}
          <Card className="border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">Upcoming Dues</CardTitle>
                  <CardDescription className="text-amber-400">Fees due this month</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDues.length > 0 ? (
                  upcomingDues.map((due, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{due.batch}</p>
                        <p className="text-xs text-amber-400 font-medium">{due.students} students</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-white">Rs. {due.amount.toLocaleString()}</p>
                        <p className="text-xs text-amber-400 font-medium">Due: {due.dueDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No upcoming dues</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Dark Mode Quick Actions */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
                <CardDescription className="text-indigo-400">Common tasks and shortcuts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Add New Student",
                  description: "Register a new student",
                  icon: Users,
                  color: "blue",
                  gradient: "from-blue-500 to-cyan-500",
                  iconBg: "bg-blue-500/20",
                  iconColor: "text-blue-400",
                  route: "/students"
                },
                {
                  title: "Create Batch",
                  description: "Add a new class batch",
                  icon: GraduationCap,
                  color: "green",
                  gradient: "from-green-500 to-emerald-500",
                  iconBg: "bg-green-500/20",
                  iconColor: "text-green-400",
                  route: "/batches"
                },
                {
                  title: "Collect Fees",
                  description: "Mark fee payments",
                  icon: () => <span className="text-lg font-bold">Rs</span>,
                  color: "purple",
                  gradient: "from-purple-500 to-violet-500",
                  iconBg: "bg-purple-500/20",
                  iconColor: "text-purple-400",
                  route: "/fees"
                },
                {
                  title: "Manage Teachers",
                  description: "Add teachers & salaries",
                  icon: BookOpen,
                  color: "orange",
                  gradient: "from-orange-500 to-amber-500",
                  iconBg: "bg-orange-500/20",
                  iconColor: "text-orange-400",
                  route: "/teachers"
                },
                {
                  title: "Track Expenses",
                  description: "Record academy expenses",
                  icon: Receipt,
                  color: "red",
                  gradient: "from-red-500 to-rose-500",
                  iconBg: "bg-red-500/20",
                  iconColor: "text-red-400",
                  route: "/expenses"
                },
                {
                  title: "View Reports",
                  description: "Analytics & insights",
                  icon: FileText,
                  color: "indigo",
                  gradient: "from-indigo-500 to-blue-500",
                  iconBg: "bg-indigo-500/20",
                  iconColor: "text-indigo-400",
                  route: "/reports"
                }
              ].map((action, index) => (
                <div 
                  key={action.title}
                  className={`group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500`}
                  onClick={() => router.push(action.route)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${action.iconBg} border border-slate-600 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-slate-100 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
    </PageProtection>
  )
}
