"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Calendar, Wallet, MapPin } from "lucide-react"
import { personalExpenseService, type PersonalExpense } from "@/lib/dataService"
import PageProtection from "@/components/PageProtection"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const getYears = () => {
  const current = new Date().getFullYear()
  const years: string[] = []
  for (let y = current - 2; y <= current + 1; y++) years.push(String(y))
  return years
}
const YEARS = getYears()

export default function PersonalExpensesPage() {
  const [expenses, setExpenses] = useState<PersonalExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString())

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    place: "",
  })

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const all = await personalExpenseService.getAll()
      setExpenses(all)
    } catch (error) {
      console.error("Error loading personal expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthKey = (dateInput: string | Date) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput)
    if (Number.isNaN(d.getTime())) return ""
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth() + 1
    return `${y}-${String(m).padStart(2, "0")}`
  }

  const selectedMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`

  const filteredByMonth = expenses.filter((e) => getMonthKey(e.date) === selectedMonthKey)
  const filteredExpenses = filteredByMonth.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.place?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const monthlyTotal = filteredByMonth.reduce((sum, e) => sum + e.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString(),
        place: formData.place || "",
      }
      if (editingExpense) {
        await personalExpenseService.update(editingExpense.id, payload)
      } else {
        await personalExpenseService.create(payload)
      }
      await loadExpenses()
      setIsDialogOpen(false)
      setEditingExpense(null)
      setFormData({
        name: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        place: "",
      })
    } catch (error) {
      console.error("Error saving personal expense:", error)
    }
  }

  const handleEdit = (expense: PersonalExpense) => {
    setEditingExpense(expense)
    setFormData({
      name: expense.name,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date.split("T")[0],
      place: expense.place || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await personalExpenseService.delete(id)
      await loadExpenses()
    } catch (error) {
      console.error("Error deleting personal expense:", error)
    }
  }

  const openAddDialog = () => {
    setEditingExpense(null)
    setFormData({
      name: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      place: "",
    })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <PageProtection>
        <div className="space-y-8 bg-slate-900 min-h-screen p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <h1 className="text-3xl font-bold tracking-tight mt-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Personal Expense
            </h1>
            <p className="text-slate-400 mt-2">Loading...</p>
          </div>
        </div>
      </PageProtection>
    )
  }

  return (
    <PageProtection>
      <div className="space-y-8 bg-slate-900 min-h-screen p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-800 p-8 text-white border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                <Wallet className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  Personal Expense
                </h1>
                <p className="text-slate-300 mt-1">Track expenses by month</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={openAddDialog}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Selected Month Total</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <span className="text-emerald-400 font-bold text-xs">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Rs. {monthlyTotal.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">
                {MONTHS[selectedMonth]} {selectedYear}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">All Time Total</CardTitle>
              <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
                <span className="text-teal-400 font-bold text-xs">Rs</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                Rs. {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total personal expenses</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Records This Month</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{filteredByMonth.length}</div>
              <p className="text-xs text-slate-400 mt-1">Entries in selected month</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 items-center">
            <Label className="text-slate-300">Month</Label>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[140px] !bg-slate-700/50 !border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)} className="text-white hover:bg-slate-700">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <Label className="text-slate-300">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] !bg-slate-700/50 !border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="text-white hover:bg-slate-700">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, description, place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 !bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingExpense ? "Edit Personal Expense" : "Add Personal Expense"}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {editingExpense ? "Update the expense details" : "Add a new personal expense."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Groceries, Fuel"
                    required
                    className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details"
                    rows={2}
                    required
                    className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place" className="text-slate-300">Place</Label>
                  <Input
                    id="place"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="e.g. Mall, Gas station"
                    className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-300">Amount (Rs.)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={0}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      required
                      className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-300">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="!bg-slate-700/50 !border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0"
                >
                  {editingExpense ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border border-slate-700 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Wallet className="h-5 w-5 text-emerald-400" />
              </div>
              Expenses — {MONTHS[selectedMonth]} {selectedYear} ({filteredExpenses.length})
            </CardTitle>
            <CardDescription className="text-slate-300">
              Filtered by selected month. Use search to narrow results.
            </CardDescription>
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
                    <TableHead className="text-slate-300 font-semibold">Place</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredExpenses]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <TableRow
                        key={expense.id}
                        className="border-slate-700 hover:bg-slate-800/50"
                      >
                        <TableCell className="font-medium text-white">{expense.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-slate-300">
                          {expense.description || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="text-emerald-400 font-medium">
                            Rs. {expense.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {expense.place ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              {expense.place}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
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
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No expenses for {MONTHS[selectedMonth]} {selectedYear}. Add one above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageProtection>
  )
}
