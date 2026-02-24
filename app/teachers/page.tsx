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
import { Plus, Edit, Trash2, Search, Phone, Mail, DollarSign, Calendar, User, History, Sparkles } from "lucide-react"
import { teacherService, salaryRecordService, batchService, type Teacher, type SalaryRecord, type Batch } from "@/lib/dataService"
import PageProtection from "@/components/PageProtection"

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadTeachers()
    loadSalaryRecords()
    loadBatches()
  }, [])

  const loadBatches = async () => {
    try {
      const allBatches = await batchService.getAll()
      setBatches(allBatches)
    } catch (error) {
      console.error("Error loading batches:", error)
    }
  }

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
    year: new Date().getFullYear().toString(),
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
  const getYears = () => {
    const current = new Date().getFullYear()
    const list: string[] = []
    for (let y = current - 2; y <= current + 1; y++) list.push(String(y))
    return list
  }
  const years = getYears()

  const batchNames = batches.map((b) => b.name).filter(Boolean)

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
        year: new Date().getFullYear().toString(),
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
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <User className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Teacher Management
            </h1>
            <p className="text-slate-400 mt-2">Loading teacher data...</p>
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
                  <User className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-2">
                    Teacher Management
                    <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
                  </h1>
                  <p className="text-slate-300 mt-1">Manage teachers and their salary payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dark Mode Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Teachers</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <User className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{teachers.length}</div>
              <p className="text-xs text-slate-400 mt-1">
                {teachers.filter((t) => t.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Monthly Budget</CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <span className="text-green-400 font-bold text-xs">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Rs. {currentSummary.totalSalaryBudget.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">This month's total</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending Payments</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <span className="text-red-400 font-bold text-xs">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">Rs. {currentSummary.totalPending.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Outstanding amount</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger 
              value="teachers" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white transition-colors"
            >
              Teachers
            </TabsTrigger>
            <TabsTrigger 
              value="salary" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white transition-colors"
            >
              Salary Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 !bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      {editingTeacher ? "Update teacher information" : "Add a new teacher to the academy."}
                    </DialogDescription>
                  </DialogHeader>
                <form onSubmit={handleTeacherSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="name"
                          value={teacherFormData.name}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                          placeholder="Enter teacher name"
                          required
                          className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                        <Select
                          value={teacherFormData.subject}
                          onValueChange={(value) => setTeacherFormData({ ...teacherFormData, subject: value })}
                        >
                          <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject} className="text-white hover:bg-slate-700">
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="batch" className="text-slate-300">Batch</Label>
                        <Select
                          value={teacherFormData.batch}
                          onValueChange={(value) => setTeacherFormData({ ...teacherFormData, batch: value })}
                        >
                          <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {batchNames.length === 0 ? (
                              <SelectItem value="_none" disabled className="text-slate-500">
                                No batches yet. Create batches first.
                              </SelectItem>
                            ) : (
                              batchNames.map((name) => (
                                <SelectItem key={name} value={name} className="text-white hover:bg-slate-700">
                                  {name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary" className="text-slate-300">Monthly Salary (Rs.)</Label>
                        <Input
                          id="salary"
                          type="number"
                          value={teacherFormData.salary}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, salary: e.target.value })}
                          placeholder="25000"
                          required
                          className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact" className="text-slate-300">Contact Number (Optional)</Label>
                        <Input
                          id="contact"
                          value={teacherFormData.contact}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, contact: e.target.value })}
                          placeholder="9876543210"
                          className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={teacherFormData.email}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, email: e.target.value })}
                          placeholder="teacher@universalacademy.edu"
                          className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-slate-300">Status</Label>
                        <Select
                          value={teacherFormData.status}
                          onValueChange={(value: "active" | "inactive") => setTeacherFormData({ ...teacherFormData, status: value })}
                        >
                          <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="active" className="text-white hover:bg-slate-700">Active</SelectItem>
                            <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {editingTeacher ? "Update" : "Add"} Teacher
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

            <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  All Teachers ({filteredTeachers.length})
                </CardTitle>
                <CardDescription className="text-slate-300">Manage teacher information and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead className="text-slate-300 font-semibold">Name</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Subject</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Batch</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Monthly Salary</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Contact</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher, index) => (
                        <TableRow 
                          key={teacher.id}
                          className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-white">{teacher.name}</div>
                              <div className="text-sm text-slate-400">{teacher.email || "No email"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{teacher.subject}</TableCell>
                          <TableCell className="text-white">{teacher.batch}</TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-orange-500/20 rounded border border-orange-500/30">
                                <span className="text-orange-400 font-bold text-xs">Rs</span>
                              </div>
                              <span className="font-medium">Rs. {teacher.salary.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {teacher.contact && (
                                <div className="flex items-center gap-1 text-sm text-white">
                                  <Phone className="h-3 w-3 text-green-400" />
                                  {teacher.contact}
                                </div>
                              )}
                              {!teacher.contact && (
                                <div className="text-sm text-slate-400">No contact</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                teacher.status === "active" 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                                  : "bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 hover:text-slate-300"
                              } font-medium transition-colors duration-200`}
                            >
                              {teacher.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditTeacher(teacher)}
                                className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 hover:border-blue-400 transition-all duration-200"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:text-red-300 hover:border-red-400 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

          <TabsContent value="salary" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Salary Payments</h3>
                <p className="text-sm text-slate-300">Track and manage teacher salary payments</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => Promise.all([loadSalaryRecords(), loadTeachers()])}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                >
                  <History className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Salary Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Salary Payment</DialogTitle>
                      <DialogDescription className="text-slate-300">Record a salary payment for a teacher</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSalarySubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="teacherId" className="text-slate-300">Teacher</Label>
                          <Select
                            value={salaryFormData.teacherId}
                            onValueChange={(value) => setSalaryFormData({ ...salaryFormData, teacherId: value })}
                          >
                            <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id.toString()} className="text-white hover:bg-slate-700">
                                  {teacher.name} - {teacher.subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="amount" className="text-slate-300">Amount (Rs.)</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={salaryFormData.amount}
                              onChange={(e) => setSalaryFormData({ ...salaryFormData, amount: e.target.value })}
                              placeholder="25000"
                              required
                              className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paymentDate" className="text-slate-300">Payment Date</Label>
                            <Input
                              id="paymentDate"
                              type="date"
                              value={salaryFormData.paymentDate}
                              onChange={(e) => setSalaryFormData({ ...salaryFormData, paymentDate: e.target.value })}
                              required
                              className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="month" className="text-slate-300">Month</Label>
                            <Select
                              value={salaryFormData.month}
                              onValueChange={(value) => setSalaryFormData({ ...salaryFormData, month: value })}
                            >
                              <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {months.map((month) => (
                                  <SelectItem key={month} value={month} className="text-white hover:bg-slate-700">
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="year" className="text-slate-300">Year</Label>
                            <Select
                              value={salaryFormData.year}
                              onValueChange={(value) => setSalaryFormData({ ...salaryFormData, year: value })}
                            >
                              <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {years.map((year) => (
                                  <SelectItem key={year} value={year} className="text-white hover:bg-slate-700">
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod" className="text-slate-300">Payment Method</Label>
                          <Select
                            value={salaryFormData.paymentMethod}
                            onValueChange={(value) => setSalaryFormData({ ...salaryFormData, paymentMethod: value })}
                          >
                            <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="Cash" className="text-white hover:bg-slate-700">Cash</SelectItem>
                              <SelectItem value="Bank Transfer" className="text-white hover:bg-slate-700">Bank Transfer</SelectItem>
                              <SelectItem value="Cheque" className="text-white hover:bg-slate-700">Cheque</SelectItem>
                              <SelectItem value="UPI" className="text-white hover:bg-slate-700">UPI</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-slate-300">Notes</Label>
                          <Textarea
                            id="notes"
                            value={salaryFormData.notes}
                            onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
                            placeholder="Payment notes or remarks"
                            rows={2}
                            className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit"
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Add Payment
                        </Button>
                      </DialogFooter>
                    </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Teacher-wise Salary Summary */}
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                Current Month Salary Status
              </CardTitle>
              <CardDescription className="text-slate-300">{new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()} salary payment status for all teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 font-semibold">Teacher</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Monthly Salary</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Paid Amount</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Remaining</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Payments</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher, index) => {
                      const currentMonth = new Date().toLocaleString("default", { month: "long" })
                      const currentYear = new Date().getFullYear().toString()
                      const summary = getTeacherSalarySummary(teacher.id, currentMonth, currentYear)
                      const isFullyPaid = summary.remaining <= 0
                      return (
                        <TableRow 
                          key={teacher.id}
                          className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-white">{teacher.name}</TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-orange-500/20 rounded border border-orange-500/30">
                                <span className="text-orange-400 font-bold text-xs">Rs</span>
                              </div>
                              <span className="font-medium">Rs. {summary.monthlySalary.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-500/20 rounded border border-green-500/30">
                                <span className="text-green-400 font-bold text-xs">Rs</span>
                              </div>
                              <span className="font-medium">Rs. {summary.totalPaid.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`${summary.remaining > 0 ? "text-red-400" : "text-green-400"} font-medium`}>
                              Rs. {Math.max(0, summary.remaining).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300 font-medium transition-colors duration-200">
                              {summary.recordCount} payments
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                isFullyPaid 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                                  : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                              } font-medium transition-colors duration-200`}
                            >
                              {isFullyPaid ? "Complete" : "Pending"}
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

          {/* Salary Payment History */}
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <History className="h-5 w-5 text-purple-400" />
                </div>
                Payment History
              </CardTitle>
              <CardDescription className="text-slate-300">All salary payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-slate-300 font-semibold">Teacher</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Month/Year</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Payment Date</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Method</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Notes</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryRecords
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .map((record, index) => (
                        <TableRow 
                          key={record.id}
                          className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-white">{record.teacherName}</TableCell>
                          <TableCell className="text-white">
                            {record.month} {record.year}
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-green-500/20 rounded border border-green-500/30">
                                <span className="text-green-400 font-bold text-xs">Rs</span>
                              </div>
                              <span className="font-medium">Rs. {record.amount.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-white">
                              <Calendar className="h-4 w-4 text-blue-400" />
                              {record.paymentDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-300 font-medium transition-colors duration-200">
                              {record.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-400">{record.notes || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteSalaryRecord(record.id)}
                              className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:text-red-300 hover:border-red-400 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PageProtection>
  )
}
