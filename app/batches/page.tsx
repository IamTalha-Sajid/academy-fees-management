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
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { batchService, type Batch } from "@/lib/dataService"

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    students: 0,
    fees: "",
    schedule: "Monday to Friday, 8:00 AM - 2:00 PM",
    status: "active" as "active" | "inactive",
  })

  // Load data on component mount
  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    try {
      const allBatches = await batchService.getAll()
      setBatches(allBatches)
    } catch (error) {
      console.error('Error loading batches:', error)
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
          students: Number.parseInt(formData.students.toString())
        })
        if (updatedBatch) {
          await loadBatches() // Reload the list
        }
      } else {
        // Create new batch
        await batchService.create({
          ...formData,
          fees: Number.parseInt(formData.fees),
          students: Number.parseInt(formData.students.toString())
        })
        await loadBatches() // Reload the list
      }
      setIsDialogOpen(false)
      setEditingBatch(null)
      setFormData({ name: "", teacher: "", students: 0, fees: "", schedule: "Monday to Friday, 8:00 AM - 2:00 PM", status: "active" })
    } catch (error) {
      console.error('Error saving batch:', error)
    }
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      teacher: batch.teacher,
      students: batch.students,
      fees: batch.fees.toString(),
      schedule: batch.schedule,
      status: batch.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const success = await batchService.delete(id)
      if (success) {
        await loadBatches() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batch Management</h1>
          <p className="text-muted-foreground">Create and manage class batches</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBatch(null)
                setFormData({ name: "", teacher: "", students: 0, fees: "", schedule: "Monday to Friday, 8:00 AM - 2:00 PM", status: "active" })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingBatch ? "Edit Batch" : "Add New Batch"}</DialogTitle>
              <DialogDescription>
                {editingBatch ? "Update batch information" : "Create a new class batch with the details below."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Class 10-A"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Input
                    id="teacher"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Teacher name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="students">Number of Students</Label>
                  <Input
                    id="students"
                    type="number"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: Number.parseInt(e.target.value) || 0 })}
                    placeholder="25"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fees">Monthly Fees (Rs.)</Label>
                  <Input
                    id="fees"
                    type="number"
                    value={formData.fees}
                    onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="Monday to Friday, 8:00 AM - 2:00 PM"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingBatch ? "Update Batch" : "Create Batch"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>A list of all class batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div className="font-medium">{batch.name}</div>
                  </TableCell>
                  <TableCell>{batch.teacher}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {batch.students}
                    </div>
                  </TableCell>
                                        <TableCell>Rs. {batch.fees.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{batch.schedule}</TableCell>
                  <TableCell>
                    <Badge variant={batch.status === "active" ? "default" : "secondary"}>
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(batch)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(batch.id)}
                      >
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
    </div>
  )
}
