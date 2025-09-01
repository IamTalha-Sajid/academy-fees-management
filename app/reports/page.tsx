"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Calendar, AlertTriangle } from "lucide-react"
import { feeRecordService, studentService, batchService, type FeeRecord } from "@/lib/dataService"
import { useToast } from "@/components/ui/use-toast"

export default function Reports() {
  const { toast } = useToast()
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Financial reports and fee collection analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            // Export functionality can be added here
            toast({
              title: "Coming Soon",
              description: "Export functionality coming soon!",
            })
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              All time collected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.collectionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Current collection rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStudents}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              Currently enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defaulters</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.defaultersCount}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              Pending payments
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Monthly Collection Chart */}
        <Card>
          <CardHeader>
          <CardTitle>Monthly Fee Collection - {selectedYear}</CardTitle>
            <CardDescription>Collected vs Pending amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
              <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                <Bar dataKey="collected" fill="#8884d8" name="Collected" />
                <Bar dataKey="pending" fill="#82ca9d" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      {/* Batch-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Batch-wise Fee Collection</CardTitle>
          <CardDescription>Collection status by class batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Collection Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchWiseData.map((batch) => {
                const total = batch.collected + batch.pending
                const rate = (batch.collected / total) * 100
                return (
                  <TableRow key={batch.batch}>
                    <TableCell className="font-medium">{batch.batch}</TableCell>
                    <TableCell>{batch.students}</TableCell>
                                          <TableCell>Rs. {batch.collected.toLocaleString()}</TableCell>
                      <TableCell>Rs. {batch.pending.toLocaleString()}</TableCell>
                    <TableCell>{rate.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={rate === 100 ? "default" : rate > 80 ? "secondary" : "destructive"}>
                        {rate === 100 ? "Complete" : rate > 80 ? "Good" : "Needs Attention"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Defaulters List */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Defaulters</CardTitle>
          <CardDescription>Students with pending fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead>Months Due</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultersData.map((defaulter, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{defaulter.student}</TableCell>
                  <TableCell>{defaulter.batch}</TableCell>
                                        <TableCell>Rs. {defaulter.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{defaulter.months} months</Badge>
                  </TableCell>
                  <TableCell>{defaulter.contact}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Send Reminder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
