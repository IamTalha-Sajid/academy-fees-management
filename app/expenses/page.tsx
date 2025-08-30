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
import { Plus, Edit, Trash2, Search, DollarSign, Calendar, AlertTriangle, TrendingDown } from "lucide-react"
import { expenseService, type Expense } from "@/lib/dataService"

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Load data on component mount
  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const allExpenses = await expenseService.getAll()
      setExpenses(allExpenses)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const [expenseFormData, setExpenseFormData] = useState({
    name: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  })

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingExpense) {
        // Update existing expense
        const updatedExpense = await expenseService.update(editingExpense.id, {
          ...expenseFormData,
          amount: Number.parseInt(expenseFormData.amount)
        })
        if (updatedExpense) {
          await loadExpenses() // Reload the list
        }
      } else {
        // Add new expense
        await expenseService.create({
          ...expenseFormData,
          amount: Number.parseInt(expenseFormData.amount),
        })
        await loadExpenses() // Reload the list
      }
      setIsDialogOpen(false)
      setEditingExpense(null)
      setExpenseFormData({
        name: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      console.error('Error saving expense:', error)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseFormData({
      name: expense.name,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date.split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const success = await expenseService.delete(id)
      if (success) {
        await loadExpenses() // Reload the list
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    }).reduce((sum, expense) => sum + expense.amount, 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">Loading expense data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">Track and manage academy expenses</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {getTotalExpenses().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {getMonthlyExpenses().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Expense entries</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingExpense(null)
                setExpenseFormData({
                  name: "",
                  description: "",
                  amount: "",
                  date: new Date().toISOString().split("T")[0],
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription>
                {editingExpense ? "Update expense information" : "Add a new expense to the academy."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Expense Name</Label>
                  <Input
                    id="name"
                    value={expenseFormData.name}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, name: e.target.value })}
                    placeholder="e.g., Office Supplies, Utilities"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                    placeholder="Detailed description of the expense"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Rs.)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                      placeholder="1000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={expenseFormData.date}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingExpense ? "Update" : "Add"} Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses ({filteredExpenses.length})</CardTitle>
          <CardDescription>Manage and track all academy expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          Rs. {expense.amount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
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
