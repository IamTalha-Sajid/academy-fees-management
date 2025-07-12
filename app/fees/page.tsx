"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, DollarSign, Filter, Download, Plus, AlertTriangle, RefreshCw, FileText } from "lucide-react"
import { feeRecordService, batchService, studentService, type FeeRecord } from "@/lib/dataService"

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
const years = ["2024", "2025", "2023"]

export default function FeeCollection() {
  const [selectedBatch, setSelectedBatch] = useState("All Batches")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date()
    return months[currentDate.getMonth()]
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentDate = new Date()
    return currentDate.getFullYear().toString()
  })
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [batches, setBatches] = useState<string[]>([])
  const [students, setStudents] = useState<any[]>([])

  // Load data on component mount
  useEffect(() => {
    loadFeeRecords()
    loadBatches()
    loadStudents()
  }, [])

  // Auto-generate fees for current month when component loads
  useEffect(() => {
    if (students.length > 0 && feeRecords.length > 0) {
      // Check if fees exist for current month
      const currentDate = new Date()
      const currentMonth = months[currentDate.getMonth()]
      const currentYear = currentDate.getFullYear().toString()
      
      const currentMonthFees = feeRecords.filter(
        record => record.month === currentMonth && record.year === currentYear
      )
      
      // If no fees exist for current month, generate them
      if (currentMonthFees.length === 0) {
        generateFeesForMonth(currentMonth, currentYear)
      }
    }
  }, [students.length, feeRecords.length])

  // Clean up invalid fees when component mounts
  useEffect(() => {
    cleanupInvalidFees()
  }, [feeRecords.length]) // Run when feeRecords changes

  const loadFeeRecords = async () => {
    try {
      const allRecords = await feeRecordService.getAll()
      setFeeRecords(allRecords)
    } catch (error) {
      console.error('Error loading fee records:', error)
    }
  }

  const cleanupInvalidFees = async () => {
    try {
      const currentDate = new Date()
      const currentMonth = months[currentDate.getMonth()]
      const currentYear = currentDate.getFullYear().toString()
      
      // Find and delete fee records that are not for the current month
      const invalidRecords = feeRecords.filter(record => {
        return record.month !== currentMonth || record.year !== currentYear
      })
      
      for (const record of invalidRecords) {
        await feeRecordService.delete(record.id)
      }
      
      if (invalidRecords.length > 0) {
        await loadFeeRecords() // Reload after cleanup
        console.log(`Cleaned up ${invalidRecords.length} invalid fee records`)
        alert(`🧹 Cleaned up ${invalidRecords.length} invalid fee records (past/future months)`)
      }
    } catch (error) {
      console.error('Error cleaning up invalid fees:', error)
    }
  }

  const generateCSVReport = () => {
    try {
      // Create CSV content
      const headers = [
        'Student Name',
        'Batch',
        'Amount',
        'Month/Year',
        'Status',
        'Payment Date',
        'Payment Method'
      ]

      const csvContent = [
        headers.join(','),
        ...filteredRecords.map(record => [
          `"${record.studentName}"`,
          `"${record.batch}"`,
          record.amount,
          `"${record.month} ${record.year}"`,
          `"${record.status}"`,
          record.paidDate ? `"${record.paidDate}"` : '""',
          record.paymentMethod ? `"${record.paymentMethod}"` : '""'
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `fee_report_${selectedMonth}_${selectedYear}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert('✅ CSV report downloaded successfully!')
    } catch (error) {
      console.error('Error generating CSV report:', error)
      alert('❌ Error generating CSV report')
    }
  }

  const generateDetailedReport = () => {
    try {
      const currentDate = new Date().toLocaleDateString()
      const totalStudents = filteredRecords.length
      const paidStudents = filteredRecords.filter(r => r.status === 'paid').length
      const pendingStudents = filteredRecords.filter(r => r.status !== 'paid').length
      const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
      const paidAmount = filteredRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0)
      const pendingAmount = totalAmount - paidAmount

      // Group by batch
      const batchSummary = filteredRecords.reduce((acc, record) => {
        if (!acc[record.batch]) {
          acc[record.batch] = {
            total: 0,
            paid: 0,
            pending: 0,
            students: 0
          }
        }
        acc[record.batch].total += record.amount
        acc[record.batch].students += 1
        if (record.status === 'paid') {
          acc[record.batch].paid += record.amount
        } else {
          acc[record.batch].pending += record.amount
        }
        return acc
      }, {} as Record<string, { total: number; paid: number; pending: number; students: number }>)

      // Create detailed report content
      let reportContent = `
FEE COLLECTION REPORT
Generated on: ${currentDate}
Period: ${selectedMonth} ${selectedYear}
Filter: ${selectedBatch} | ${selectedMonth} | ${selectedYear}

SUMMARY
=======
Total Students: ${totalStudents}
Paid Students: ${paidStudents}
Pending Students: ${pendingStudents}
Total Amount: Rs. ${totalAmount.toLocaleString()}
Paid Amount: Rs. ${paidAmount.toLocaleString()}
Pending Amount: Rs. ${pendingAmount.toLocaleString()}
Collection Rate: ${totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(1) : 0}%

BATCH SUMMARY
============
`
      Object.entries(batchSummary).forEach(([batch, data]) => {
        reportContent += `
${batch}:
  Students: ${data.students}
  Total Amount: Rs. ${data.total.toLocaleString()}
  Paid Amount: Rs. ${data.paid.toLocaleString()}
  Pending Amount: Rs. ${data.pending.toLocaleString()}
  Collection Rate: ${data.students > 0 ? ((data.paid / data.total) * 100).toFixed(1) : 0}%
`
      })

      reportContent += `
DETAILED RECORDS
================
`
      filteredRecords.forEach((record, index) => {
        reportContent += `
${index + 1}. ${record.studentName} (${record.batch})
   Amount: Rs. ${record.amount.toLocaleString()}
   Status: ${record.status.toUpperCase()}
   ${record.paidDate ? `Paid Date: ${record.paidDate}` : 'Not Paid'}
   ${record.paymentMethod ? `Payment Method: ${record.paymentMethod}` : ''}
`
      })

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `detailed_fee_report_${selectedMonth}_${selectedYear}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert('✅ Detailed report downloaded successfully!')
    } catch (error) {
      console.error('Error generating detailed report:', error)
      alert('❌ Error generating detailed report')
    }
  }

  const handleExportReport = () => {
    if (filteredRecords.length === 0) {
      alert('⚠️ No data available to export. Please select filters to view fee records.')
      return
    }
    
    // Show options to user
    const choice = confirm(
      'Choose report format:\n\n' +
      'OK = CSV Report (Excel compatible)\n' +
      'Cancel = Detailed Text Report'
    )
    
    if (choice) {
      generateCSVReport()
    } else {
      generateDetailedReport()
    }
  }

  const copySummaryToClipboard = () => {
    if (filteredRecords.length === 0) {
      alert('⚠️ No data available to copy. Please select filters to view fee records.')
      return
    }

    const totalStudents = filteredRecords.length
    const paidStudents = filteredRecords.filter(r => r.status === 'paid').length
    const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
    const paidAmount = filteredRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.amount, 0)
    const pendingAmount = totalAmount - paidAmount

    const summary = `
Fee Collection Summary - ${selectedMonth} ${selectedYear}
Filter: ${selectedBatch} | ${selectedMonth} | ${selectedYear}

📊 Summary:
• Total Students: ${totalStudents}
• Paid Students: ${paidStudents}
• Pending Students: ${totalStudents - paidStudents}
• Total Amount: Rs. ${totalAmount.toLocaleString()}
• Paid Amount: Rs. ${paidAmount.toLocaleString()}
• Pending Amount: Rs. ${pendingAmount.toLocaleString()}
• Collection Rate: ${totalStudents > 0 ? ((paidStudents / totalStudents) * 100).toFixed(1) : 0}%

Generated on: ${new Date().toLocaleDateString()}
    `.trim()

    navigator.clipboard.writeText(summary).then(() => {
      alert('✅ Summary copied to clipboard!')
    }).catch(() => {
      alert('❌ Failed to copy to clipboard')
    })
  }

  const loadBatches = async () => {
    try {
      const allBatches = await batchService.getAll()
      const batchNames = allBatches.map(batch => batch.name)
      setBatches(batchNames)
    } catch (error) {
      console.error('Error loading batches:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const allStudents = await studentService.getAll()
      setStudents(allStudents)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const filteredRecords = feeRecords.filter((record) => {
    return (
      (selectedBatch === "All Batches" || record.batch === selectedBatch) &&
      (selectedMonth === "All Months" || record.month === selectedMonth) &&
      (selectedYear === "All Years" || record.year === selectedYear)
    )
  })

  const handleMarkPaid = async (id: number, paymentMethod: string = "Cash") => {
    try {
      const updatedRecord = await feeRecordService.markAsPaid(id, paymentMethod)
      if (updatedRecord) {
        await loadFeeRecords() // Reload the list
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const handleMarkUnpaid = async (id: number) => {
    try {
      const updatedRecord = await feeRecordService.markAsPending(id)
      if (updatedRecord) {
        await loadFeeRecords() // Reload the list
      }
    } catch (error) {
      console.error('Error marking as unpaid:', error)
    }
  }

  const generateFeesForMonth = async (month: string, year: string) => {
    try {
      // Check if the selected month is the current month
      const currentDate = new Date()
      const currentMonth = months[currentDate.getMonth()]
      const currentYear = currentDate.getFullYear().toString()
      
      // Only allow fee generation for the current month
      if (month !== currentMonth || year !== currentYear) {
        alert(`❌ Fees can only be generated for the current month (${currentMonth} ${currentYear}).\n\nPlease select ${currentMonth} ${currentYear} to generate fees.`)
        return
      }
      
      // Generate fee records for all active students for the specific month
      for (const student of students) {
        if (student.status === 'active') {
          // Check if fee record already exists for this student and month
          const existingRecord = feeRecords.find(
            record => record.studentId === student.id && 
                     record.month === month && 
                     record.year === year
          )
          
          if (!existingRecord) {
            // Calculate accumulated amount for overdue fees
            let accumulatedAmount = student.fees
            const targetDate = new Date(`${year}-${months.indexOf(month) + 1}-01`)
            
            // Only consider UNPAID records from previous months as overdue
            const overdueRecords = feeRecords.filter(
              record => record.studentId === student.id && 
                       record.status !== 'paid' &&
                       new Date(`${record.year}-${months.indexOf(record.month) + 1}-01`) < targetDate
            )
            
            // Add overdue amounts (double the fee for each overdue month)
            accumulatedAmount += overdueRecords.length * student.fees
            
            await feeRecordService.create({
              studentId: student.id,
              studentName: student.name,
              batch: student.batch,
              amount: accumulatedAmount,
              month: month,
              year: year,
              status: 'pending',
              paidDate: null,
              paymentMethod: null
            })
          }
        }
      }
      
      await loadFeeRecords() // Reload the list
      alert(`✅ Fees generated successfully for ${month} ${year}!`)
    } catch (error) {
      console.error('Error generating fees for month:', error)
      alert(`❌ Error generating fees: ${error}`)
    }
  }

  const regenerateFeesForMonth = async (month: string, year: string) => {
    try {
      // Check if the selected month is the current month
      const currentDate = new Date()
      const currentMonth = months[currentDate.getMonth()]
      const currentYear = currentDate.getFullYear().toString()
      
      // Only allow fee regeneration for the current month
      if (month !== currentMonth || year !== currentYear) {
        alert(`❌ Fees can only be regenerated for the current month (${currentMonth} ${currentYear}).\n\nPlease select ${currentMonth} ${currentYear} to regenerate fees.`)
        return
      }
      
      // Delete existing fee records for this month and year
      const existingRecords = feeRecords.filter(
        record => record.month === month && record.year === year
      )
      
      for (const record of existingRecords) {
        await feeRecordService.delete(record.id)
      }
      
      // Generate new fee records
      await generateFeesForMonth(month, year)
      alert(`✅ Fees regenerated successfully for ${month} ${year}!`)
    } catch (error) {
      console.error('Error regenerating fees for month:', error)
      alert(`❌ Error regenerating fees: ${error}`)
    }
  }

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month)
    
    // If a specific month is selected, generate fees for that month
    if (month !== "All Months") {
      await generateFeesForMonth(month, selectedYear)
    }
  }

  const handleYearChange = async (year: string) => {
    setSelectedYear(year)
    
    // If a specific month is selected, generate fees for that month
    if (selectedMonth !== "All Months") {
      await generateFeesForMonth(selectedMonth, year)
    }
  }

  const isOverdue = (record: FeeRecord) => {
    const recordDate = new Date(`${record.year}-${months.indexOf(record.month) + 1}-01`)
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    // Only mark as overdue if it's from a previous month AND unpaid
    return record.status !== 'paid' && recordDate < currentMonthStart
  }

  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
  const paidAmount = filteredRecords.filter((r) => r.status === "paid").reduce((sum, record) => sum + record.amount, 0)
  const pendingAmount = totalAmount - paidAmount
  const overdueAmount = feeRecords
    .filter(record => isOverdue(record))
    .reduce((sum, record) => sum + record.amount, 0)

  // Get current month and year
  const currentDate = new Date()
  const currentMonth = months[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear().toString()
  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Collection</h1>
          <p className="text-muted-foreground">Mark fee payments and track collections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
          <Button variant="outline" onClick={copySummaryToClipboard}>
            <FileText className="mr-2 h-4 w-4" />
            Copy Summary
          </Button>
          {selectedMonth !== "All Months" && (
            <Button 
              variant="outline" 
              onClick={() => regenerateFeesForMonth(selectedMonth, selectedYear)}
              disabled={!isCurrentMonth}
              title={!isCurrentMonth ? `Fees can only be generated for the current month (${currentMonth} ${currentYear})` : "Regenerate fees for current month"}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Fees
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredRecords.length} students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. {paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter((r) => r.status === "paid").length} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Rs. {pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter((r) => r.status !== "paid").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs. {overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Past due amounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Batches">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Months">All Months</SelectItem>
                  {months.map((month) => {
                    const isCurrentMonthItem = month === currentMonth
                    return (
                    <SelectItem key={month} value={month}>
                        {month} {isCurrentMonthItem && "(Current Month)"}
                    </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {selectedMonth !== "All Months" && !isCurrentMonth && (
                <p className="text-xs text-red-600">
                  ⚠️ Fees can only be generated for {currentMonth} {currentYear}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Years">All Years</SelectItem>
                  {years.map((year) => {
                    const isCurrentYear = year === currentYear
                    return (
                    <SelectItem key={year} value={year}>
                        {year} {isCurrentYear && "(Current Year)"}
                    </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value="All Status" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            {feeRecords.length === 0 
              ? `Select the current month (${currentMonth} ${currentYear}) to generate fee records. Fees can only be generated for the current month.`
              : `Manage and track fee payments (overdue amounts are accumulated). Use 'Regenerate Fees' to recalculate amounts if payments were made. Showing ${filteredRecords.length} records for ${selectedBatch} | ${selectedMonth} | ${selectedYear}.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feeRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No fee records available</p>
              <p className="text-sm text-muted-foreground">Select a month from the filter above to generate fee records</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                  <TableHead>Amount</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredRecords.map((record) => {
                  const overdue = isOverdue(record)
                  
                  return (
                    <TableRow key={record.id} className={overdue ? "bg-red-50" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.studentName}</div>
                          {overdue && (
                            <div className="text-xs text-red-600">Overdue</div>
                          )}
                        </div>
                      </TableCell>
                  <TableCell>{record.batch}</TableCell>
                  <TableCell>
                        <div className="font-medium">Rs. {record.amount.toLocaleString()}</div>
                        {overdue && (
                          <div className="text-xs text-red-600">
                            Includes overdue amounts
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                    {record.month} {record.year}
                        </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                            record.status === "paid"
                              ? "default"
                              : overdue
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {overdue ? "overdue" : record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.paidDate ? (
                          <span className="text-sm">{record.paidDate}</span>
                    ) : (
                          <span className="text-sm text-muted-foreground">Not paid</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.status !== "paid" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(record.id)}
                            >
                            Mark Paid
                          </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkUnpaid(record.id)}
                            >
                          Mark Unpaid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                  )
                })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
