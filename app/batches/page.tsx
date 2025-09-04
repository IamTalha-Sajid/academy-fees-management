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
import { Plus, Edit, Trash2, Users, BookOpen, Sparkles, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { batchService, studentService, type Batch } from "@/lib/dataService"
import PageProtection from "@/components/PageProtection"

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualStudentCounts, setActualStudentCounts] = useState<Record<string, number>>({})
  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    fees: "",
    schedule: "Monday to Friday, 8:00 AM - 2:00 PM",
    status: "active" as "active" | "inactive",
  })

  // Calculate statistics
  const totalBatches = batches.length
  const activeBatches = batches.filter(batch => batch.status === "active").length
  const totalStudents = Object.values(actualStudentCounts).reduce((sum, count) => sum + count, 0)

  // Load data on component mount
  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    try {
      setLoading(true)
      const allBatches = await batchService.getAll()
      setBatches(allBatches)
      
      // Load actual student counts for each batch
      const studentCounts: Record<string, number> = {}
      for (const batch of allBatches) {
        const students = await studentService.getByBatch(batch.name)
        studentCounts[batch.name] = students.length
      }
      setActualStudentCounts(studentCounts)
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBatch) {
        // Update existing batch
        const updatedBatch = await batchService.update(editingBatch.id, {
          ...formData,
          fees: Number.parseInt(formData.fees),
          students: 0 // This will be calculated from actual students
        })
        if (updatedBatch) {
          await loadBatches() // Reload the list
        }
      } else {
        // Create new batch
        await batchService.create({
          ...formData,
          fees: Number.parseInt(formData.fees),
          students: 0 // This will be calculated from actual students
        })
        await loadBatches() // Reload the list
      }
      setIsDialogOpen(false)
      setEditingBatch(null)
      setFormData({ name: "", teacher: "", fees: "", schedule: "Monday to Friday, 8:00 AM - 2:00 PM", status: "active" })
    } catch (error) {
      console.error('Error saving batch:', error)
    }
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      teacher: batch.teacher,
      fees: batch.fees.toString(),
      schedule: batch.schedule,
      status: batch.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await batchService.delete(id)
      if (success) {
        await loadBatches() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
    }
  }

  if (loading) {
    return (
      <PageProtection>
        <div className="space-y-6 bg-slate-900 min-h-screen p-6">
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto"></div>
              <BookOpen className="w-6 h-6 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Batch Management
            </h1>
            <p className="text-slate-400 mt-2">Loading batch information...</p>
          </div>
        </div>
      </PageProtection>
    )
  }

  return (
    <PageProtection>
      <div className="space-y-8 bg-slate-900 min-h-screen p-6">
        {/* Enhanced Dark Mode Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 p-8 text-white border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <BookOpen className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">Batch Management</h1>
                  <p className="text-slate-300 text-lg">Create and manage class batches</p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => {
                      setEditingBatch(null)
                      setFormData({ name: "", teacher: "", fees: "", schedule: "Monday to Friday, 8:00 AM - 2:00 PM", status: "active" })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Batch
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                        <BookOpen className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-white">{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          {editingBatch ? "Update batch information" : "Create a new class batch with the details below."}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-slate-300 font-medium">Batch Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Class 10-A"
                          required
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="teacher" className="text-slate-300 font-medium">Teacher</Label>
                        <Input
                          id="teacher"
                          value={formData.teacher}
                          onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                          placeholder="Teacher name"
                          required
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                        />
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
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="schedule" className="text-slate-300 font-medium">Schedule</Label>
                        <Input
                          id="schedule"
                          value={formData.schedule}
                          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                          placeholder="Monday to Friday, 8:00 AM - 2:00 PM"
                          required
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status" className="text-slate-300 font-medium">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white focus:border-green-500 focus:ring-green-500/20">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="active" className="text-white hover:bg-slate-600">Active</SelectItem>
                            <SelectItem value="inactive" className="text-white hover:bg-slate-600">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {editingBatch ? "Update Batch" : "Create Batch"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-slate-200">Active Batches: {activeBatches}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">Total Students: {totalStudents}</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Total Batches",
              value: totalBatches.toString(),
              description: "All batches",
              icon: BookOpen,
              gradient: "from-blue-500 to-cyan-500",
              iconBg: "bg-blue-500/20",
              iconColor: "text-blue-400",
            },
            {
              title: "Active Batches",
              value: activeBatches.toString(),
              description: "Currently running",
              icon: TrendingUp,
              gradient: "from-green-500 to-emerald-500",
              iconBg: "bg-green-500/20",
              iconColor: "text-green-400",
            },
            {
              title: "Total Students",
              value: totalStudents.toString(),
              description: "Enrolled students",
              icon: Users,
              gradient: "from-purple-500 to-violet-500",
              iconBg: "bg-purple-500/20",
              iconColor: "text-purple-400",
            }
          ].map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-slate-800 to-slate-900 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-300">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.iconBg} border border-slate-600 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <p className="text-sm text-slate-400">{stat.description}</p>
                {/* Progress bar */}
                <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
                  ></div>
                </div>
              </CardContent>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          ))}
        </div>


        {/* Enhanced Batches Table */}
        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">All Batches</CardTitle>
                <CardDescription className="text-blue-400">A comprehensive list of all class batches</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-600 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-700/50 border-slate-600">
                    <TableHead className="text-slate-300 font-semibold">Batch Name</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Teacher</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Students</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Fees</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Schedule</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch, index) => (
                    <TableRow 
                      key={batch.id} 
                      className="border-slate-600 hover:bg-slate-700/30 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="font-semibold text-white">{batch.name}</div>
                      </TableCell>
                      <TableCell className="text-slate-300">{batch.teacher}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-purple-500/20 rounded border border-purple-500/30">
                            <Users className="h-3 w-3 text-purple-400" />
                          </div>
                          <span className="text-white font-medium">{actualStudentCounts[batch.name] || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-orange-500/20 rounded border border-orange-500/30">
                            <span className="text-orange-400 font-bold text-xs">Rs</span>
                          </div>
                          <span className="text-white font-medium">Rs. {batch.fees.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {batch.schedule}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${
                            batch.status === "active" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:text-green-300" 
                              : "bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 hover:text-slate-300"
                          } font-medium transition-colors duration-200`}
                        >
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(batch)}
                            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(batch.id)}
                            className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-200"
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
    </PageProtection>
  )
}
