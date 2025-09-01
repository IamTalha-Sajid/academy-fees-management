"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Phone, Mail, DollarSign, Calendar, User, History } from "lucide-react"
import { teacherService, salaryRecordService, type Teacher, type SalaryRecord } from "@/lib/dataService"

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadTeachers()
    loadSalaryRecords()
  }, [])

  // Reload data when salary records change to update summary
  useEffect(() => {
    if (salaryRecords.length > 0) {
      // This will trigger a re-render of the summary table
    }
  }, [salaryRecords])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      const allTeachers = await teacherService.getAll()
      setTeachers(allTeachers)
    } catch (error) {
      console.error('Error loading teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSalaryRecords = async () => {
    try {
      const allSalaryRecords = await salaryRecordService.getAll()
      setSalaryRecords(allSalaryRecords)
    } catch (error) {
      console.error('Error loading salary records:', error)
    }
  }

  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false)
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("teachers")

  const [teacherFormData, setTeacherFormData] = useState({
    name: "",
    subject: "",
    contact: "",
    email: "",
    batch: "",
    salary: "",
    status: "active" as "active" | "inactive",
  } as {
    name: string
    subject: string
    contact: string
    email: string
    batch: string
    salary: string
    status: "active" | "inactive"
  })

  const [salaryFormData, setSalaryFormData] = useState({
    teacherId: "",
    amount: "",
    month: "",
    year: "2025",
    paymentDate: "",
    paymentMethod: "Cash",
    notes: "",
    type: "partial" as "partial" | "full",
  })

  const subjects = [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "English",
    "Hindi",
    "History",
    "Geography",
    "Economics",
    "Computer Science",
  ]
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
  const years = ["2025", "2024", "2023", "2022"]
  const batches = [
    "Class 9-A",
    "Class 9-B",
    "Class 9-C",
    "Class 10-A",
    "Class 10-B",
    "Class 11-A",
    "Class 11-B",
    "Class 12-A",
    "Class 12-B",
  ]

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.contact && teacher.contact.includes(searchTerm)),
  )

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTeacher) {
        // Update existing teacher
        const updatedTeacher = await teacherService.update(editingTeacher.id, {
          ...teacherFormData,
          salary: Number.parseInt(teacherFormData.salary)
        })
        if (updatedTeacher) {
          await loadTeachers() // Reload the list
        }
      } else {
        // Add new teacher
        await teacherService.create({
          ...teacherFormData,
          salary: Number.parseInt(teacherFormData.salary),
          joinDate: new Date().toISOString().split("T")[0],
        })
        await loadTeachers() // Reload the list
      }
      setIsTeacherDialogOpen(false)
      setEditingTeacher(null)
      setTeacherFormData({
        name: "",
        subject: "",
        contact: "",
        email: "",
        batch: "",
        salary: "",
        status: "active" as "active" | "inactive",
      })
    } catch (error) {
      console.error('Error saving teacher:', error)
    }
  }

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const teacher = teachers.find((t) => t.id === salaryFormData.teacherId)
      if (!teacher) {
        console.error('Teacher not found')
        return
      }
      
      await salaryRecordService.create({
        teacherId: salaryFormData.teacherId,
        teacherName: teacher.name,
        amount: Number.parseInt(salaryFormData.amount),
        month: salaryFormData.month,
        year: salaryFormData.year,
        paymentDate: salaryFormData.paymentDate,
        paymentMethod: salaryFormData.paymentMethod,
        notes: salaryFormData.notes,
        type: salaryFormData.type,
      })
      
      // Reload both salary records and teachers to update the summary
      await Promise.all([loadSalaryRecords(), loadTeachers()])
      setIsSalaryDialogOpen(false)
      setSalaryFormData({
        teacherId: "",
        amount: "",
        month: "",
        year: "2025",
        paymentDate: "",
        paymentMethod: "Cash",
        notes: "",
        type: "partial" as "partial" | "full",
      })
    } catch (error) {
      console.error('Error saving salary record:', error)
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setTeacherFormData({
      name: teacher.name,
      subject: teacher.subject,
      contact: teacher.contact || "",
      email: teacher.email || "",
      batch: teacher.batch,
      salary: teacher.salary.toString(),
      status: teacher.status,
    })
    setIsTeacherDialogOpen(true)
  }

  const handleDeleteTeacher = async (id: string) => {
    try {
      const success = await teacherService.delete(id)
      if (success) {
        await loadTeachers() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
    }
  }

  const handleDeleteSalaryRecord = async (id: string) => {
    try {
      const success = await salaryRecordService.delete(id)
      if (success) {
        await loadSalaryRecords() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting salary record:', error)
    }
  }

  const getTeacherSalarySummary = (teacherId: string, month: string, year: string) => {
    const records = salaryRecords.filter(
      (record) => record.teacherId === teacherId && record.month === month && record.year === year,
    )
    const totalPaid = records.reduce((sum, record) => sum + record.amount, 0)
    const teacher = teachers.find((t) => t.id === teacherId)
    const monthlySalary = teacher ? teacher.salary : 0
    const remaining = monthlySalary - totalPaid
    return { totalPaid, remaining, monthlySalary, recordCount: records.length }
  }

  const getCurrentMonthSummary = () => {
    const currentMonth = new Date().toLocaleString("default", { month: "long" })
    const currentYear = new Date().getFullYear().toString()

    let totalSalaryBudget = 0
    let totalPaid = 0
    let totalPending = 0

    teachers.forEach((teacher) => {
      const summary = getTeacherSalarySummary(teacher.id, currentMonth, currentYear)
      totalSalaryBudget += summary.monthlySalary
      totalPaid += summary.totalPaid
      totalPending += summary.remaining
    })

    return { totalSalaryBudget, totalPaid, totalPending }
  }

  const currentSummary = getCurrentMonthSummary()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
          <p className="text-muted-foreground">Loading teacher data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
          <p className="text-muted-foreground">Manage teachers and their salary payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teachers.filter((t) => t.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold">Rs. {currentSummary.totalSalaryBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month's total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold text-red-600">Rs. {currentSummary.totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="salary">Salary Management</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingTeacher(null)
                    setTeacherFormData({
                      name: "",
                      subject: "",
                      contact: "",
                      email: "",
                      batch: "",
                      salary: "",
                      status: "active" as "active" | "inactive",
                    })
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
                  <DialogDescription>
                    {editingTeacher ? "Update teacher information" : "Add a new teacher to the academy."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTeacherSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={teacherFormData.name}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                          placeholder="Enter teacher name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={teacherFormData.subject}
                          onValueChange={(value) => setTeacherFormData({ ...teacherFormData, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="batch">Batch</Label>
                        <Select
                          value={teacherFormData.batch}
                          onValueChange={(value) => setTeacherFormData({ ...teacherFormData, batch: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.map((batch) => (
                              <SelectItem key={batch} value={batch}>
                                {batch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Monthly Salary (Rs.)</Label>
                        <Input
                          id="salary"
                          type="number"
                          value={teacherFormData.salary}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, salary: e.target.value })}
                          placeholder="25000"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact Number (Optional)</Label>
                        <Input
                          id="contact"
                          value={teacherFormData.contact}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, contact: e.target.value })}
                          placeholder="9876543210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={teacherFormData.email}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                          placeholder="teacher@universalacademy.edu"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={teacherFormData.status}
                          onValueChange={(value: "active" | "inactive") => setTeacherFormData({ ...teacherFormData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingTeacher ? "Update" : "Add"} Teacher</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Teachers ({filteredTeachers.length})</CardTitle>
              <CardDescription>Manage teacher information and details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Monthly Salary</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground">{teacher.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>{teacher.batch}</TableCell>
                      <TableCell>Rs. {teacher.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {teacher.contact && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {teacher.contact}
                            </div>
                          )}
                          {teacher.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </div>
                          )}
                          {!teacher.contact && !teacher.email && (
                            <div className="text-sm text-muted-foreground">No contact info</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={teacher.status === "active" ? "default" : "secondary"}>{teacher.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTeacher(teacher.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="salary" className="space-y-4">
           <div className="flex justify-between items-center">
             <div>
               <h3 className="text-lg font-semibold">Salary Payments</h3>
               <p className="text-sm text-muted-foreground">Track and manage teacher salary payments</p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={() => Promise.all([loadSalaryRecords(), loadTeachers()])}>
                 <History className="mr-2 h-4 w-4" />
                 Refresh
               </Button>
               <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                 <DialogTrigger asChild>
                   <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Salary Payment
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[500px]">
                   <DialogHeader>
                     <DialogTitle>Add Salary Payment</DialogTitle>
                     <DialogDescription>Record a salary payment for a teacher</DialogDescription>
                   </DialogHeader>
                                       <form onSubmit={handleSalarySubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacherId">Teacher</Label>
                          <Select
                            value={salaryFormData.teacherId}
                            onValueChange={(value) => setSalaryFormData({ ...salaryFormData, teacherId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                  {teacher.name} - {teacher.subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (Rs.)</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={salaryFormData.amount}
                              onChange={(e) => setSalaryFormData({ ...salaryFormData, amount: e.target.value })}
                              placeholder="25000"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paymentDate">Payment Date</Label>
                            <Input
                              id="paymentDate"
                              type="date"
                              value={salaryFormData.paymentDate}
                              onChange={(e) => setSalaryFormData({ ...salaryFormData, paymentDate: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="month">Month</Label>
                            <Select
                              value={salaryFormData.month}
                              onValueChange={(value) => setSalaryFormData({ ...salaryFormData, month: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month} value={month}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Select
                              value={salaryFormData.year}
                              onValueChange={(value) => setSalaryFormData({ ...salaryFormData, year: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select
                            value={salaryFormData.paymentMethod}
                            onValueChange={(value) => setSalaryFormData({ ...salaryFormData, paymentMethod: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={salaryFormData.notes}
                            onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
                            placeholder="Payment notes or remarks"
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Payment</Button>
                      </DialogFooter>
                    </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

                     {/* Teacher-wise Salary Summary */}
           <Card>
             <CardHeader>
               <CardTitle>Current Month Salary Status</CardTitle>
               <CardDescription>{new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()} salary payment status for all teachers</CardDescription>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Teacher</TableHead>
                     <TableHead>Monthly Salary</TableHead>
                     <TableHead>Paid Amount</TableHead>
                     <TableHead>Remaining</TableHead>
                     <TableHead>Payments</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {teachers.map((teacher) => {
                     const currentMonth = new Date().toLocaleString("default", { month: "long" })
                     const currentYear = new Date().getFullYear().toString()
                     const summary = getTeacherSalarySummary(teacher.id, currentMonth, currentYear)
                     const isFullyPaid = summary.remaining <= 0
                     return (
                       <TableRow key={teacher.id}>
                         <TableCell className="font-medium">{teacher.name}</TableCell>
                         <TableCell>Rs. {summary.monthlySalary.toLocaleString()}</TableCell>
                         <TableCell>Rs. {summary.totalPaid.toLocaleString()}</TableCell>
                         <TableCell>
                           <span className={summary.remaining > 0 ? "text-red-600" : "text-green-600"}>
                             Rs. {Math.max(0, summary.remaining).toLocaleString()}
                           </span>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline">{summary.recordCount} payments</Badge>
                         </TableCell>
                         <TableCell>
                           <Badge variant={isFullyPaid ? "default" : "destructive"}>
                             {isFullyPaid ? "Complete" : "Pending"}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     )
                   })}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>

          {/* Salary Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>All salary payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryRecords
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.teacherName}</TableCell>
                        <TableCell>
                          {record.month} {record.year}
                        </TableCell>
                        <TableCell>Rs. {record.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {record.paymentDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{record.notes || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSalaryRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
