// Types for our data
export interface Student {
  id: string
  name: string
  batch: string
  fees: number
  contact?: string
  email?: string
  address: string
  status: 'active' | 'inactive'
  joinDate: string
}

export interface Batch {
  id: string
  name: string
  teacher: string
  students: number
  fees: number
  schedule: string
  status: 'active' | 'inactive'
}

export interface Teacher {
  id: string
  name: string
  subject: string
  contact?: string
  email?: string
  batch: string
  salary: number
  joinDate: string
  status: 'active' | 'inactive'
}

export interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  batch: string
  amount: number
  month: string
  year: string
  status: 'paid' | 'pending' | 'overdue'
  paidDate: string | null
  paymentMethod: string | null
}

export interface SalaryRecord {
  id: string
  teacherId: string
  teacherName: string
  amount: number
  month: string
  year: string
  paymentDate: string
  paymentMethod: string
  notes?: string
  type: 'full' | 'partial'
}

export interface Expense {
  id: string
  name: string
  description: string
  amount: number
  date: string
}

export interface AppData {
  students: Student[]
  batches: Batch[]
  teachers: Teacher[]
  feeRecords: FeeRecord[]
  salaryRecords: SalaryRecord[]
  expenses: Expense[]
}

// Helper function to fetch data from API
async function fetchData(): Promise<AppData> {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      students: [],
      batches: [],
      teachers: [],
      feeRecords: [],
      salaryRecords: [],
      expenses: []
    }
  }
}

// Helper function to update data via API
async function updateData(action: string, data?: any, id?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data, id }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return true
  } catch (error) {
    console.error('Error updating data:', error)
    return false
  }
}

// Student operations
export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const data = await fetchData()
    return data.students
  },

  getById: async (id: string): Promise<Student | undefined> => {
    const data = await fetchData()
    return data.students.find(student => student.id === id)
  },

  getByBatch: async (batchName: string): Promise<Student[]> => {
    const data = await fetchData()
    return data.students.filter(student => student.batch === batchName && student.status === 'active')
  },

  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const success = await updateData('createStudent', student)
    if (!success) {
      throw new Error('Failed to create student')
    }
    return { ...student, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student | null> => {
    const success = await updateData('updateStudent', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.students.find(student => student.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteStudent', undefined, id)
  }
}

// Batch operations
export const batchService = {
  getAll: async (): Promise<Batch[]> => {
    const data = await fetchData()
    return data.batches
  },

  getById: async (id: string): Promise<Batch | undefined> => {
    const data = await fetchData()
    return data.batches.find(batch => batch.id === id)
  },

  create: async (batch: Omit<Batch, 'id'>): Promise<Batch> => {
    const success = await updateData('createBatch', batch)
    if (!success) {
      throw new Error('Failed to create batch')
    }
    return { ...batch, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<Batch>): Promise<Batch | null> => {
    const success = await updateData('updateBatch', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.batches.find(batch => batch.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteBatch', undefined, id)
  }
}

// Teacher operations
export const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    const data = await fetchData()
    return data.teachers
  },

  getById: async (id: string): Promise<Teacher | undefined> => {
    const data = await fetchData()
    return data.teachers.find(teacher => teacher.id === id)
  },

  create: async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
    const success = await updateData('createTeacher', teacher)
    if (!success) {
      throw new Error('Failed to create teacher')
    }
    return { ...teacher, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
    const success = await updateData('updateTeacher', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.teachers.find(teacher => teacher.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteTeacher', undefined, id)
  }
}

// Fee Record operations
export const feeRecordService = {
  getAll: async (): Promise<FeeRecord[]> => {
    const data = await fetchData()
    return data.feeRecords
  },

  getById: async (id: string): Promise<FeeRecord | undefined> => {
    const data = await fetchData()
    return data.feeRecords.find(record => record.id === id)
  },

  getByStudentId: async (studentId: string): Promise<FeeRecord[]> => {
    const data = await fetchData()
    return data.feeRecords.filter(record => record.studentId === studentId)
  },

  create: async (record: Omit<FeeRecord, 'id'>): Promise<FeeRecord> => {
    const success = await updateData('createFeeRecord', record)
    if (!success) {
      throw new Error('Failed to create fee record')
    }
    return { ...record, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<FeeRecord>): Promise<FeeRecord | null> => {
    const success = await updateData('updateFeeRecord', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.feeRecords.find(record => record.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteFeeRecord', undefined, id)
  },

  markAsPaid: async (id: string, paymentMethod: string = 'Cash'): Promise<FeeRecord | null> => {
    const success = await updateData('markFeePaid', { paymentMethod }, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.feeRecords.find(record => record.id === id) || null
  },

  markAsPending: async (id: string): Promise<FeeRecord | null> => {
    const success = await updateData('markFeePending', undefined, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.feeRecords.find(record => record.id === id) || null
  }
}

// Salary Record operations
export const salaryRecordService = {
  getAll: async (): Promise<SalaryRecord[]> => {
    const data = await fetchData()
    return data.salaryRecords
  },

  getById: async (id: string): Promise<SalaryRecord | undefined> => {
    const data = await fetchData()
    return data.salaryRecords.find(record => record.id === id)
  },

  getByTeacherId: async (teacherId: string): Promise<SalaryRecord[]> => {
    const data = await fetchData()
    return data.salaryRecords.filter(record => record.teacherId === teacherId)
  },

  create: async (record: Omit<SalaryRecord, 'id'>): Promise<SalaryRecord> => {
    const success = await updateData('createSalaryRecord', record)
    if (!success) {
      throw new Error('Failed to create salary record')
    }
    return { ...record, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<SalaryRecord>): Promise<SalaryRecord | null> => {
    const success = await updateData('updateSalaryRecord', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.salaryRecords.find(record => record.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteSalaryRecord', undefined, id)
  }
}

// Dashboard statistics
export const dashboardService = {
  getStats: async () => {
    const data = await fetchData()
    const totalStudents = data.students.filter(s => s.status === 'active').length
    const totalBatches = data.batches.filter(b => b.status === 'active').length
    const totalRevenue = data.feeRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, record) => sum + record.amount, 0)
    const pendingFees = data.feeRecords
      .filter(r => r.status !== 'paid')
      .reduce((sum, record) => sum + record.amount, 0)
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      totalStudents,
      totalBatches,
      totalRevenue,
      pendingFees,
      totalExpenses
    }
  },

  getRecentPayments: async (limit: number = 5): Promise<FeeRecord[]> => {
    const data = await fetchData()
    return data.feeRecords
      .filter(r => r.status === 'paid')
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
      .slice(0, limit)
  },

  getUpcomingDues: async (): Promise<{ batch: string; students: number; amount: number; dueDate: string }[]> => {
    const data = await fetchData()
    const pendingRecords = data.feeRecords.filter(r => r.status !== 'paid')
    
    // Group by batch and calculate totals
    const batchTotals = pendingRecords.reduce((acc, record) => {
      if (!acc[record.batch]) {
        acc[record.batch] = { students: 0, amount: 0 }
      }
      acc[record.batch].students++
      acc[record.batch].amount += record.amount
      return acc
    }, {} as Record<string, { students: number; amount: number }>)

    return Object.entries(batchTotals).map(([batch, data]) => ({
      batch,
      students: data.students,
      amount: data.amount,
      dueDate: new Date().toISOString().split('T')[0] // Today's date for demo
    }))
  }
}

// Expense operations
export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    const data = await fetchData()
    return data.expenses
  },

  getById: async (id: string): Promise<Expense | undefined> => {
    const data = await fetchData()
    return data.expenses.find(expense => expense.id === id)
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const success = await updateData('createExpense', expense)
    if (!success) {
      throw new Error('Failed to create expense')
    }
    return { ...expense, id: Date.now().toString() }
  },

  update: async (id: string, updates: Partial<Expense>): Promise<Expense | null> => {
    const success = await updateData('updateExpense', updates, id)
    if (!success) {
      return null
    }
    const data = await fetchData()
    return data.expenses.find(expense => expense.id === id) || null
  },

  delete: async (id: string): Promise<boolean> => {
    return await updateData('deleteExpense', undefined, id)
  }
} 