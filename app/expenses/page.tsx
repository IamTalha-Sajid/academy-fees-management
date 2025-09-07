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
import { Plus, Edit, Trash2, Search, Calendar, AlertTriangle, TrendingDown, Sparkles, Receipt } from "lucide-react"
import { expenseService, type Expense } from "@/lib/dataService"
import PageProtection from "@/components/PageProtection"
import { useSettings } from "@/contexts/SettingsContext"

export default function ExpenseManagement() {
  const { showFeesAndIncome } = useSettings()
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
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
              <Receipt className="w-6 h-6 text-orange-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Expense Management
            </h1>
            <p className="text-slate-400 mt-2">Loading expense data...</p>
          </div>
        </div>
      </PageProtection>
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
                <h2 className="text-2xl font-bold text-white mb-2">Expense Tracking Disabled</h2>
                <p className="text-slate-300 mb-4">
                  Expense tracking has been disabled by the administrator.
                </p>
                <p className="text-slate-400 text-sm">
                  Contact your administrator to enable expense tracking.
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-orange-900 to-slate-800 p-8 text-white border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                  <Receipt className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent flex items-center gap-2">
                    Expense Management
                    <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
                  </h1>
                  <p className="text-slate-300 mt-1">Track and manage academy expenses</p>
                </div>
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
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Enhanced Dark Mode Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Expenses</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <span className="text-red-400 font-bold text-xs">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Rs. {getTotalExpenses().toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">All time expenses</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">This Month</CardTitle>
              <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <Calendar className="h-4 w-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Rs. {getMonthlyExpenses().toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Current month total</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Records</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{expenses.length}</div>
              <p className="text-xs text-slate-400 mt-1">Expense entries</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 !bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription className="text-slate-300">
              {editingExpense ? "Update expense information" : "Add a new expense to the academy."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Expense Name</Label>
                <Input
                  id="name"
                  value={expenseFormData.name}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, name: e.target.value })}
                  placeholder="e.g., Office Supplies, Utilities"
                  required
                  className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  placeholder="Detailed description of the expense"
                  rows={3}
                  required
                  className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300">Amount (Rs.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    placeholder="1000"
                    required
                    className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                    required
                    className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingExpense ? "Update" : "Add"} Expense
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <Receipt className="h-5 w-5 text-orange-400" />
              </div>
              All Expenses ({filteredExpenses.length})
            </CardTitle>
            <CardDescription className="text-slate-300">Manage and track all academy expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-semibold">Name</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Description</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Amount</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense, index) => (
                      <TableRow 
                        key={expense.id}
                        className="border-slate-700 hover:bg-slate-800/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-white">{expense.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-slate-300">{expense.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-red-500/20 rounded border border-red-500/30">
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            </div>
                            <span className="text-red-400 font-medium">
                              Rs. {expense.amount.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-white">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditExpense(expense)}
                              className="bg-orange-600/20 border-orange-500/50 text-orange-400 hover:bg-orange-600/30 hover:text-orange-300 hover:border-orange-400 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteExpense(expense.id)}
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
    </PageProtection>
  )
}
