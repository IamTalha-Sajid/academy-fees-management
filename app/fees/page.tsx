"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Filter, Download, Plus, AlertTriangle, RefreshCw, FileText, Search, Sparkles, TrendingUp, TrendingDown, ArrowUpRight, Trash2 } from "lucide-react"
import { feeRecordService, batchService, studentService, type FeeRecord } from "@/lib/dataService"
import { useToast } from "@/components/ui/use-toast"
import PageProtection from "@/components/PageProtection"
import { useSettings } from "@/contexts/SettingsContext"

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
  const { toast } = useToast()
  const { showFeesAndIncome } = useSettings()
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadFeeRecords(),
        loadBatches(),
        loadStudents()
      ])
    }
    loadAllData()
  }, [])

  // Removed automatic fee generation - fees should only be generated manually via button

  // Removed automatic cleanup to prevent data loss
  // Cleanup should only be done manually when needed
  // useEffect(() => {
  //   cleanupDuplicateFees()
  // }, [feeRecords.length])

  // Automatically sync batches when fee records change
  useEffect(() => {
    if (feeRecords.length > 0) {
      const feeRecordBatches = [...new Set(feeRecords.map(record => record.batch))].filter(Boolean)
      if (feeRecordBatches.length > 0) {
        setBatches(prevBatches => {
          // Normalize case and combine batches
          const normalizedFeeBatches = feeRecordBatches.map(batch => 
            batch.charAt(0).toUpperCase() + batch.slice(1).toLowerCase()
          )
          const normalizedPrevBatches = prevBatches.map(batch => 
            batch.charAt(0).toUpperCase() + batch.slice(1).toLowerCase()
          )
          const combined = [...new Set([...normalizedPrevBatches, ...normalizedFeeBatches])]
          return combined
        })
      }
    }
  }, [feeRecords])

  const loadFeeRecords = async () => {
    try {
      const allRecords = await feeRecordService.getAll()
      setFeeRecords(allRecords)
      // Batches will be automatically synced by useEffect
    } catch (error) {
      console.error('Error loading fee records:', error)
    }
  }

  // REMOVED: This function was causing data loss by deleting all non-current month records
  // const cleanupInvalidFees = async () => {
  //   // This function was deleting ALL fee records that were not for the current month
  //   // This is WRONG - we need to keep records for all months!
  // }

  const cleanupDuplicateFees = async () => {
    try {
      console.log('Starting duplicate fee cleanup...')
      
      // Group fee records by student, month, and year (only duplicates within same month)
      const groupedRecords = feeRecords.reduce((acc, record) => {
        const key = `${record.studentId}-${record.month}-${record.year}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(record)
        return acc
      }, {} as Record<string, FeeRecord[]>)
      
      let deletedCount = 0
      const duplicateGroups = Object.entries(groupedRecords).filter(([_, records]) => records.length > 1)
      
      console.log(`Found ${duplicateGroups.length} groups with duplicates`)
      
      // For each group with duplicates, keep only the first record and delete the rest
      for (const [key, records] of duplicateGroups) {
        console.log(`Processing duplicate group: ${key} (${records.length} records)`)
        
        // Sort by creation date (assuming newer records have higher IDs)
        const sortedRecords = records.sort((a, b) => {
          // Convert string IDs to numbers for comparison, fallback to 0 if invalid
          const aId = isNaN(Number(a.id)) ? 0 : Number(a.id)
          const bId = isNaN(Number(b.id)) ? 0 : Number(b.id)
          return aId - bId
        })
        
        // Keep the first record, delete the rest
        for (let i = 1; i < sortedRecords.length; i++) {
          console.log(`Deleting duplicate record: ${sortedRecords[i].id} for student ${sortedRecords[i].studentName}`)
          await feeRecordService.delete(sortedRecords[i].id)
          deletedCount++
        }
      }
      
      if (deletedCount > 0) {
        await loadFeeRecords() // Reload after cleanup
        console.log(`✅ Cleaned up ${deletedCount} duplicate fee records`)
        toast({
          title: "Duplicate Cleanup Complete",
          description: `🧹 Cleaned up ${deletedCount} duplicate fee records within same month`,
        })
      } else {
        console.log('No duplicate fee records found')
        toast({
          title: "No Duplicates Found",
          description: "All fee records are unique within their respective months",
        })
      }
    } catch (error) {
      console.error('Error cleaning up duplicate fees:', error)
      toast({
        title: "Cleanup Error",
        description: "Failed to clean up duplicate fees. Please try again.",
        variant: "destructive"
      })
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
      
      toast({
        title: "Success",
        description: "✅ CSV report downloaded successfully!",
      })
    } catch (error) {
      console.error('Error generating CSV report:', error)
      toast({
        title: "Error",
        description: "❌ Error generating CSV report",
        variant: "destructive",
      })
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
      
      toast({
        title: "Success",
        description: "✅ Detailed report downloaded successfully!",
      })
    } catch (error) {
      console.error('Error generating detailed report:', error)
      toast({
        title: "Error",
        description: "❌ Error generating detailed report",
        variant: "destructive",
      })
    }
  }

  const handleExportReport = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "No Data",
        description: "⚠️ No data available to export. Please select filters to view fee records.",
        variant: "destructive",
      })
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
      toast({
        title: "No Data",
        description: "⚠️ No data available to copy. Please select filters to view fee records.",
        variant: "destructive",
      })
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
      toast({
        title: "Success",
        description: "✅ Summary copied to clipboard!",
      })
    }).catch(() => {
      toast({
        title: "Error",
        description: "❌ Failed to copy to clipboard",
        variant: "destructive",
      })
    })
  }

  const loadBatches = async () => {
    try {
      const allBatches = await batchService.getAll()
      const batchNames = allBatches.map(batch => batch.name)
      
      // Also get unique batches from fee records to ensure we have all possible batches
      const feeRecordBatches = [...new Set(feeRecords.map(record => record.batch))].filter(Boolean)
      
      // Normalize case for all batch names
      const normalizedBatchNames = batchNames.map(batch => 
        batch.charAt(0).toUpperCase() + batch.slice(1).toLowerCase()
      )
      const normalizedFeeBatches = feeRecordBatches.map(batch => 
        batch.charAt(0).toUpperCase() + batch.slice(1).toLowerCase()
      )
      
      // Combine both sources and remove duplicates
      const allBatchNames = [...new Set([...normalizedBatchNames, ...normalizedFeeBatches])]
      
      setBatches(allBatchNames)
    } catch (error) {
      console.error('Error loading batches from service:', error)
      // Fallback: get unique batches from fee records
      try {
        const uniqueBatches = [...new Set(feeRecords.map(record => record.batch))].filter(Boolean)
        setBatches(uniqueBatches)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setBatches([])
      }
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

  const isOverdue = (record: FeeRecord) => {
    const recordDate = new Date(`${record.year}-${months.indexOf(record.month) + 1}-01`)
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    // Only mark as overdue if it's from a previous month AND unpaid
    return record.status !== 'paid' && recordDate < currentMonthStart
  }

  const filteredRecords = feeRecords.filter((record) => {
    const matchesSearch = searchTerm === "" || 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.batch.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "All Status" || 
      (selectedStatus === "paid" && record.status === "paid") ||
      (selectedStatus === "pending" && record.status === "pending") ||
      (selectedStatus === "overdue" && isOverdue(record))
    
    // Case-insensitive batch matching
    const batchMatch = selectedBatch === "All Batches" || 
      record.batch.toLowerCase() === selectedBatch.toLowerCase()
    
    return (
      matchesSearch &&
      matchesStatus &&
      batchMatch &&
      (selectedMonth === "All Months" || record.month === selectedMonth) &&
      (selectedYear === "All Years" || record.year === selectedYear)
    )
  })

  const handleMarkPaid = async (id: string, paymentMethod: string = "Cash") => {
    try {
      const updatedRecord = await feeRecordService.markAsPaid(id, paymentMethod)
      if (updatedRecord) {
        await loadFeeRecords() // Reload the list
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const handleMarkUnpaid = async (id: string) => {
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
      // Allow fee generation for any month (current or past)
      // Duplication protection is handled by checking existing records
      
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
      toast({
        title: "Success",
        description: `✅ Fees generated successfully for ${month} ${year}!`,
      })
    } catch (error) {
      console.error('Error generating fees for month:', error)
      toast({
        title: "Error",
        description: `❌ Error generating fees: ${error}`,
        variant: "destructive",
      })
    }
  }

  const regenerateFeesForMonth = async (month: string, year: string) => {
    try {
      // Allow fee regeneration for any month (current or past)
      // Duplication protection is handled by checking existing records
      
      let generatedCount = 0
      let skippedCount = 0
      
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
            generatedCount++
          } else {
            skippedCount++
          }
        }
      }
      
      await loadFeeRecords() // Reload the list
      
      if (generatedCount > 0) {
        toast({
          title: "Success",
          description: `✅ Generated fees for ${generatedCount} students. Skipped ${skippedCount} students who already have fees for ${month} ${year}.`,
        })
      } else {
        toast({
          title: "No New Fees Generated",
          description: `ℹ️ All students already have fees for ${month} ${year}. No duplicates created.`,
        })
      }
    } catch (error) {
      console.error('Error regenerating fees for month:', error)
      toast({
        title: "Error",
        description: `❌ Error regenerating fees: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    // No automatic fee generation - only when button is clicked
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    // No automatic fee generation - only when button is clicked
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

  // Show message when fees are disabled
  if (!showFeesAndIncome) {
    return (
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600 mb-6">
                <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Fees Management Disabled</h2>
                <p className="text-slate-300 mb-4">
                  Fees and income tracking has been disabled by the administrator.
                </p>
                <p className="text-slate-400 text-sm">
                  Contact your administrator to enable fees management.
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8 text-white border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                  <CalendarDays className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Fee Collection
                  </h1>
                  <p className="text-slate-300 mt-1">Mark fee payments and track collections</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleExportReport}
                  className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={copySummaryToClipboard}
                  className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copy Summary
                </Button>
                {selectedMonth !== "All Months" && (
                  <Button 
                    variant="outline" 
                    onClick={() => regenerateFeesForMonth(selectedMonth, selectedYear)}
                    title="Generate fees for students who don't have fees for this month"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Missing Fees
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={cleanupDuplicateFees}
                  title="Remove duplicate fee records within the same month"
                  className="bg-gradient-to-r from-orange-600 to-red-600 border-orange-500 text-white hover:from-orange-700 hover:to-red-700 transition-all duration-200"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Duplicates
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dark Mode Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              title: "Total Amount",
              value: `Rs. ${totalAmount.toLocaleString()}`,
              description: `${filteredRecords.length} students`,
              icon: () => <span className="text-lg font-bold text-blue-400">Rs</span>,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50",
              iconBg: "bg-blue-500/20",
              iconColor: "text-blue-400",
              textColor: "text-white"
            },
            {
              title: "Collected",
              value: `Rs. ${paidAmount.toLocaleString()}`,
              description: `${filteredRecords.filter((r) => r.status === "paid").length} payments`,
              icon: () => <span className="text-lg font-bold text-green-400">Rs</span>,
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-50 to-emerald-50",
              iconBg: "bg-green-500/20",
              iconColor: "text-green-400",
              textColor: "text-green-400"
            },
            {
              title: "Pending",
              value: `Rs. ${pendingAmount.toLocaleString()}`,
              description: `${filteredRecords.filter((r) => r.status !== "paid").length} pending`,
              icon: () => <span className="text-lg font-bold text-yellow-400">Rs</span>,
              gradient: "from-yellow-500 to-orange-500",
              bgGradient: "from-yellow-50 to-orange-50",
              iconBg: "bg-yellow-500/20",
              iconColor: "text-yellow-400",
              textColor: "text-yellow-400"
            },
            {
              title: "Overdue",
              value: `Rs. ${overdueAmount.toLocaleString()}`,
              description: "Past due amounts",
              icon: AlertTriangle,
              gradient: "from-red-500 to-rose-500",
              bgGradient: "from-red-50 to-rose-50",
              iconBg: "bg-red-500/20",
              iconColor: "text-red-400",
              textColor: "text-red-400"
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
                  {typeof stat.icon === 'function' ? <stat.icon /> : <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
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

        {/* Enhanced Dark Mode Search Bar */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students or batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 !bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1 h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600/50"
              >
                ×
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Search className="h-4 w-4 text-blue-400" />
            {filteredRecords.length} records found
          </div>
        </div>

        {/* Enhanced Dark Mode Filters */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Filter className="h-5 w-5 text-blue-400" />
              </div>
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All Batches" className="text-white hover:bg-slate-700">All Batches</SelectItem>
                    {batches.length > 0 ? (
                      batches.map((batch) => (
                        <SelectItem key={batch} value={batch} className="text-white hover:bg-slate-700">
                          {batch}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="No batches" disabled className="text-slate-500">
                        No batches available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Month</Label>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All Months" className="text-white hover:bg-slate-700">All Months</SelectItem>
                    {months.map((month) => {
                      const isCurrentMonthItem = month === currentMonth
                      return (
                      <SelectItem key={month} value={month} className="text-white hover:bg-slate-700">
                          {month} {isCurrentMonthItem && "(Current Month)"}
                      </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Year</Label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All Years" className="text-white hover:bg-slate-700">All Years</SelectItem>
                    {years.map((year) => {
                      const isCurrentYear = year === currentYear
                      return (
                      <SelectItem key={year} value={year} className="text-white hover:bg-slate-700">
                          {year} {isCurrentYear && "(Current Year)"}
                      </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="All Status" className="text-white hover:bg-slate-700">All Status</SelectItem>
                    <SelectItem value="paid" className="text-white hover:bg-slate-700">Paid</SelectItem>
                    <SelectItem value="pending" className="text-white hover:bg-slate-700">Pending</SelectItem>
                    <SelectItem value="overdue" className="text-white hover:bg-slate-700">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Dark Mode Fee Records Table */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              Fee Records
            </CardTitle>
            <CardDescription className="text-slate-300">
              {feeRecords.length === 0 
                ? `Select a month and year to generate fee records. Use 'Generate Missing Fees' to add fees for students who don't have fees for the selected month.`
                : `Manage and track fee payments (overdue amounts are accumulated). Use 'Generate Missing Fees' to add fees for new students. Showing ${filteredRecords.length} records for ${selectedBatch} | ${selectedMonth} | ${selectedYear} | ${selectedStatus}${searchTerm ? ` | Search: "${searchTerm}"` : ''}.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feeRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full border border-slate-600 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-slate-300 mb-2 font-medium">No fee records available</p>
                <p className="text-sm text-slate-400">Select a month from the filter above to generate fee records</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-semibold">Student</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Batch</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Month/Year</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Payment Date</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => {
                    const overdue = isOverdue(record)
                    
                    return (
                      <TableRow 
                        key={record.id} 
                        className={`border-slate-700 hover:bg-slate-800/50 transition-colors duration-200 ${
                          overdue ? "bg-red-900/20 border-red-500/30" : ""
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{record.studentName}</div>
                            {overdue && (
                              <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                Overdue
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-500/20 rounded border border-purple-500/30">
                              <span className="text-purple-400 font-bold text-xs">B</span>
                            </div>
                            <span className="text-white font-medium">{record.batch}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-orange-500/20 rounded border border-orange-500/30">
                              <span className="text-orange-400 font-bold text-xs">Rs</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">Rs. {record.amount.toLocaleString()}</div>
                              {overdue && (
                                <div className="text-xs text-red-400">
                                  Includes overdue amounts
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-blue-400" />
                            <span className="text-white">{record.month} {record.year}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              record.status === "paid" 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                                : overdue
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 hover:text-yellow-300"
                            } font-medium transition-colors duration-200`}
                          >
                            {overdue ? "overdue" : record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.paidDate ? (
                            <span className="text-sm text-green-400 font-medium">{record.paidDate}</span>
                          ) : (
                            <span className="text-sm text-slate-400">Not paid</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.status !== "paid" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkPaid(record.id)}
                                className="bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/30 hover:text-green-300 hover:border-green-400 transition-all duration-200"
                              >
                                Mark Paid
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkUnpaid(record.id)}
                                className="bg-slate-600/20 border-slate-500/50 text-slate-400 hover:bg-slate-600/30 hover:text-slate-300 hover:border-slate-400 transition-all duration-200"
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
            </div>
            )}
          </CardContent>
        </Card>
    </div>
    </PageProtection>
  )
}
