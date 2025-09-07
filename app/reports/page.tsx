"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, TrendingUp, TrendingDown, Users, Calendar, AlertTriangle, Sparkles, Activity, BarChart3, FileText } from "lucide-react"
import { feeRecordService, studentService, batchService, type FeeRecord } from "@/lib/dataService"
import { useToast } from "@/components/ui/use-toast"
import PageProtection from "@/components/PageProtection"
import { useSettings } from "@/contexts/SettingsContext"

export default function Reports() {
  const { toast } = useToast()
  const { showFeesAndIncome } = useSettings()
  const [selectedYear, setSelectedYear] = useState("2025")
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allFeeRecords, allStudents, allBatches] = await Promise.all([
        feeRecordService.getAll(),
        studentService.getAll(),
        batchService.getAll()
      ])
      setFeeRecords(allFeeRecords)
      setStudents(allStudents)
      setBatches(allBatches)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate monthly data for the selected year
  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map(month => {
      const monthRecords = feeRecords.filter(record => 
        record.year === selectedYear && 
        record.month.toLowerCase().includes(month.toLowerCase())
      )
      
      const collected = monthRecords
        .filter(record => record.status === 'paid')
        .reduce((sum, record) => sum + record.amount, 0)
      
      const pending = monthRecords
        .filter(record => record.status !== 'paid')
        .reduce((sum, record) => sum + record.amount, 0)
      
      return { month, collected, pending }
    })
  }

  // Calculate batch-wise data
  const getBatchWiseData = () => {
    return batches.map(batch => {
      const batchRecords = feeRecords.filter(record => record.batch === batch.name)
      const batchStudents = students.filter(student => student.batch === batch.name)
      
      const collected = batchRecords
        .filter(record => record.status === 'paid')
        .reduce((sum, record) => sum + record.amount, 0)
      
      const pending = batchRecords
        .filter(record => record.status !== 'paid')
        .reduce((sum, record) => sum + record.amount, 0)
      
      return {
        batch: batch.name,
        students: batchStudents.length,
        collected,
        pending
      }
    })
  }

  // Calculate defaulters data
  const getDefaultersData = () => {
    const defaulters = feeRecords
      .filter(record => record.status !== 'paid')
      .map(record => {
        const student = students.find(s => s.id === record.studentId)
        // Calculate months overdue
        const recordDate = new Date(`${record.year}-${getMonthNumber(record.month)}-01`)
        const currentDate = new Date()
        const monthsOverdue = Math.max(0, 
          (currentDate.getFullYear() - recordDate.getFullYear()) * 12 + 
          (currentDate.getMonth() - recordDate.getMonth())
        )
        
        return {
          student: record.studentName,
          batch: record.batch,
          amount: record.amount,
          months: monthsOverdue + 1,
          contact: student?.contact || 'N/A'
        }
      })
    
    return defaulters.slice(0, 10) // Show top 10 defaulters
  }

  // Helper function to get month number
  const getMonthNumber = (monthName: string) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"]
    return months.indexOf(monthName) + 1
  }

  // Calculate key metrics
  const getKeyMetrics = () => {
    const totalRevenue = feeRecords
      .filter(record => record.status === 'paid')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const totalPending = feeRecords
      .filter(record => record.status !== 'paid')
      .reduce((sum, record) => sum + record.amount, 0)
    
    const totalStudents = students.filter(s => s.status === 'active').length
    const defaultersCount = feeRecords.filter(record => record.status !== 'paid').length
    
    const collectionRate = totalRevenue + totalPending > 0 
      ? ((totalRevenue / (totalRevenue + totalPending)) * 100).toFixed(1)
      : '0.0'
    
    return {
      totalRevenue,
      totalPending,
      totalStudents,
      defaultersCount,
      collectionRate
    }
  }

  const monthlyData = getMonthlyData()
  const batchWiseData = getBatchWiseData()
  const defaultersData = getDefaultersData()
  const metrics = getKeyMetrics()

  if (loading) {
    return (
      <div className="space-y-8 bg-slate-900 min-h-screen p-6">
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-slate-400 mt-2">Loading your financial insights...</p>
        </div>
      </div>
    )
  }

  // Show message when fees are disabled
  if (!showFeesAndIncome) {
    return (
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600 mb-6">
                <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Reports Disabled</h2>
                <p className="text-slate-300 mb-4">
                  Financial reports have been disabled by the administrator.
                </p>
                <p className="text-slate-400 text-sm">
                  Contact your administrator to enable financial reporting.
                </p>
              </div>
            </div>
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
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
                  Reports & Analytics
                  <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                </h1>
                <p className="text-slate-300 mt-1">Financial reports and fee collection analytics</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32 !bg-slate-700/50 !border-slate-600 text-white focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="2025" className="text-white hover:bg-slate-700">2025</SelectItem>
                  <SelectItem value="2024" className="text-white hover:bg-slate-700">2024</SelectItem>
                  <SelectItem value="2023" className="text-white hover:bg-slate-700">2023</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Export functionality can be added here
                  toast({
                    title: "Coming Soon",
                    description: "Export functionality coming soon!",
                  })
                }}
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dark Mode Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: `Rs. ${metrics.totalRevenue.toLocaleString()}`,
            description: "All time collected",
            icon: () => <span className="text-lg font-bold text-green-400">Rs</span>,
            gradient: "from-green-500 to-emerald-500",
            iconBg: "bg-green-500/20",
            iconColor: "text-green-400",
            textColor: "text-green-400",
            trendIcon: TrendingUp,
            trendColor: "text-green-400"
          },
          {
            title: "Collection Rate",
            value: `${metrics.collectionRate}%`,
            description: "Current collection rate",
            icon: TrendingUp,
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
            textColor: "text-blue-400",
            trendIcon: TrendingUp,
            trendColor: "text-blue-400"
          },
          {
            title: "Active Students",
            value: metrics.totalStudents.toString(),
            description: "Currently enrolled",
            icon: Users,
            gradient: "from-purple-500 to-violet-500",
            iconBg: "bg-purple-500/20",
            iconColor: "text-purple-400",
            textColor: "text-purple-400",
            trendIcon: TrendingUp,
            trendColor: "text-purple-400"
          },
          {
            title: "Defaulters",
            value: metrics.defaultersCount.toString(),
            description: "Pending payments",
            icon: AlertTriangle,
            gradient: "from-red-500 to-rose-500",
            iconBg: "bg-red-500/20",
            iconColor: "text-red-400",
            textColor: "text-red-400",
            trendIcon: TrendingDown,
            trendColor: "text-red-400"
          }
        ].map((stat, index) => (
          <Card 
            key={stat.title}
            className="group relative overflow-hidden border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800 to-slate-900"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg} border border-slate-600 group-hover:scale-110 transition-transform duration-300`}>
                {typeof stat.icon === 'function' ? <stat.icon /> : React.createElement(stat.icon, { className: `h-5 w-5 ${stat.iconColor}` })}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1 flex items-center">
                <stat.trendIcon className={`h-3 w-3 mr-1 ${stat.trendColor}`} />
                {stat.description}
              </p>
              <div className="mt-3">
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {/* Enhanced Dark Mode Monthly Collection Chart */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              Monthly Fee Collection - {selectedYear}
            </CardTitle>
            <CardDescription className="text-slate-300">Collected vs Pending amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="collected" fill="#10B981" name="Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Dark Mode Batch-wise Performance */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              Batch-wise Fee Collection
            </CardTitle>
            <CardDescription className="text-slate-300">Collection status by class batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-semibold">Batch</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Students</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Collected</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Pending</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Collection Rate</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchWiseData.map((batch, index) => {
                    const total = batch.collected + batch.pending
                    const rate = (batch.collected / total) * 100
                    return (
                      <TableRow 
                        key={batch.batch}
                        className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-white">{batch.batch}</TableCell>
                        <TableCell className="text-white">{batch.students}</TableCell>
                        <TableCell className="text-green-400 font-medium">Rs. {batch.collected.toLocaleString()}</TableCell>
                        <TableCell className="text-yellow-400 font-medium">Rs. {batch.pending.toLocaleString()}</TableCell>
                        <TableCell className="text-white font-medium">{rate.toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              rate === 100 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300"
                                : rate > 80 
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                            } font-medium transition-colors duration-200`}
                          >
                            {rate === 100 ? "Complete" : rate > 80 ? "Good" : "Needs Attention"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Dark Mode Defaulters List */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              Fee Defaulters
            </CardTitle>
            <CardDescription className="text-slate-300">Students with pending fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-semibold">Student Name</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Batch</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Pending Amount</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Months Due</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Contact</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defaultersData.map((defaulter, index) => (
                    <TableRow 
                      key={index}
                      className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium text-white">{defaulter.student}</TableCell>
                      <TableCell className="text-white">{defaulter.batch}</TableCell>
                      <TableCell className="text-red-400 font-medium">Rs. {defaulter.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 font-medium transition-colors duration-200">
                          {defaulter.months} months
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{defaulter.contact}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-orange-600/20 border-orange-500/50 text-orange-400 hover:bg-orange-600/30 hover:text-orange-300 hover:border-orange-400 transition-all duration-200"
                        >
                          Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageProtection>
  )
}
