"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Phone, Mail, Sparkles, Users, BookOpen, TrendingUp, ArrowUpRight, Activity } from "lucide-react"
import { studentService, batchService, type Student } from "@/lib/dataService"

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    fees: "",
    contact: "",
    email: "",
    address: "",
    status: "active" as "active" | "inactive",
  })

  // Load data on component mount
  useEffect(() => {
    loadStudents()
    loadBatches()
  }, [])

  const loadStudents = async () => {
    try {
      const allStudents = await studentService.getAll()
      setStudents(allStudents)
    } catch (error) {
      console.error('Error loading students:', error)
    }
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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.contact && student.contact.includes(searchTerm))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        // Update existing student
        const updatedStudent = await studentService.update(editingStudent.id, {
          ...formData,
          fees: Number.parseInt(formData.fees)
        })
        if (updatedStudent) {
          await loadStudents() // Reload the list
        }
      } else {
        // Create new student
        await studentService.create({
          ...formData,
          fees: Number.parseInt(formData.fees),
          joinDate: new Date().toISOString().split("T")[0],
        })
        await loadStudents() // Reload the list
      }
      setIsDialogOpen(false)
      setEditingStudent(null)
      setFormData({ name: "", batch: "", fees: "", contact: "", email: "", address: "", status: "active" })
    } catch (error) {
      console.error('Error saving student:', error)
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      batch: student.batch,
      fees: student.fees.toString(),
      contact: student.contact || "",
      email: student.email || "",
      address: student.address,
      status: student.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await studentService.delete(id)
      if (success) {
        await loadStudents() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  return (
    <div className="space-y-8 bg-slate-900 min-h-screen p-6">
      {/* Enhanced Dark Mode Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 p-8 text-white border border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent flex items-center gap-2">
                  Student Management
                  <Sparkles className="h-6 w-6 text-green-400 animate-pulse" />
                </h1>
                <p className="text-slate-300 mt-1">Add and manage student information</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingStudent(null)
                    setFormData({ name: "", batch: "", fees: "", contact: "", email: "", address: "", status: "active" })
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                      <Users className="h-4 w-4 text-green-400" />
                    </div>
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    {editingStudent ? "Update student information" : "Add a new student to the academy."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-slate-300 font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter student name"
                        required
                        className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="batch" className="text-slate-300 font-medium">Batch</Label>
                      <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                        <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-green-500">
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {batches.map((batch) => (
                            <SelectItem key={batch} value={batch} className="text-white hover:bg-slate-700">
                              {batch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fees" className="text-slate-300 font-medium">Monthly Fees (Rs.)</Label>
                      <Input
                        id="fees"
                        type="number"
                        value={formData.fees}
                        onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                        placeholder="5000"
                        required
                        className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact" className="text-slate-300 font-medium">Contact Number (Optional)</Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="9876543210"
                        className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-slate-300 font-medium">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student@email.com"
                        className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address" className="text-slate-300 font-medium">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                        required
                        className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-slate-300 font-medium">Status</Label>
                      <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="!bg-slate-700/50 !border-slate-600 text-white focus:border-green-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="active" className="text-white hover:bg-slate-700">Active</SelectItem>
                          <SelectItem value="inactive" className="text-white hover:bg-slate-700">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200"
                    >
                      {editingStudent ? "Update Student" : "Add Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Dark Mode Search */}
      <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <Search className="h-5 w-5 text-green-400" />
            </div>
            Search Students
          </CardTitle>
          <CardDescription className="text-slate-300">Find students by name, batch, or contact number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 !bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Dark Mode Students Table */}
      <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            All Students
          </CardTitle>
          <CardDescription className="text-slate-300">A list of all registered students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300 font-semibold">Name</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Batch</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Fees</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Contact</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id}
                    className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{student.name}</div>
                        <div className="text-sm text-slate-400">
                          {student.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-500/20 rounded border border-purple-500/30">
                          <span className="text-purple-400 font-bold text-xs">B</span>
                        </div>
                        <span className="text-white font-medium">{student.batch}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-orange-500/20 rounded border border-orange-500/30">
                          <span className="text-orange-400 font-bold text-xs">Rs</span>
                        </div>
                        <span className="text-white font-medium">Rs. {student.fees.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {student.contact ? (
                          <>
                            <Phone className="h-4 w-4 text-green-400" />
                            <span className="text-white">{student.contact}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">No contact</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          student.status === "active" 
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 hover:text-slate-300"
                        } font-medium transition-colors duration-200`}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 hover:border-blue-400 transition-all duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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
    </div>
  )
}
