import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Student from '@/lib/models/Student'
import Batch from '@/lib/models/Batch'
import Teacher from '@/lib/models/Teacher'
import FeeRecord from '@/lib/models/FeeRecord'
import SalaryRecord from '@/lib/models/SalaryRecord'
import Expense from '@/lib/models/Expense'

// Helper function to convert MongoDB documents to plain objects with id field
const transformDocument = (doc: any) => {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : doc
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined
  }
}

// Helper function to transform arrays of documents
const transformDocuments = (docs: any[]) => {
  return docs.map(transformDocument).filter(Boolean)
}

export async function GET() {
  try {
    await connectToDatabase()

    // Fetch all data from MongoDB
    const [students, batches, teachers, feeRecords, salaryRecords, expenses] = await Promise.all([
      Student.find({}).lean(),
      Batch.find({}).lean(),
      Teacher.find({}).lean(),
      FeeRecord.find({}).lean(),
      SalaryRecord.find({}).lean(),
      Expense.find({}).lean(),
    ])

    // Transform the data to include id fields
    const dataStore = {
      students: transformDocuments(students),
      batches: transformDocuments(batches),
      teachers: transformDocuments(teachers),
      feeRecords: transformDocuments(feeRecords),
      salaryRecords: transformDocuments(salaryRecords),
      expenses: transformDocuments(expenses),
    }

    return NextResponse.json(dataStore, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/data:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { action, data, id } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    let result = null

    switch (action) {
      // Student operations
      case 'createStudent':
        result = await Student.create(data)
        break

      case 'updateStudent':
        result = await Student.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }
        break

      case 'deleteStudent':
        result = await Student.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }
        break

      // Batch operations
      case 'createBatch':
        result = await Batch.create(data)
        break

      case 'updateBatch':
        result = await Batch.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }
        break

      case 'deleteBatch':
        result = await Batch.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }
        break

      // Fee Record operations
      case 'createFeeRecord':
        result = await FeeRecord.create(data)
        break

      case 'updateFeeRecord':
        result = await FeeRecord.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'deleteFeeRecord':
        result = await FeeRecord.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'markFeePaid':
        const updateData = {
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: data.paymentMethod || 'Cash'
        }
        result = await FeeRecord.findByIdAndUpdate(id, updateData, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'markFeePending':
        const pendingData = {
          status: 'pending',
          paidDate: null,
          paymentMethod: null
        }
        result = await FeeRecord.findByIdAndUpdate(id, pendingData, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      // Teacher operations
      case 'createTeacher':
        result = await Teacher.create(data)
        break

      case 'updateTeacher':
        result = await Teacher.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }
        break

      case 'deleteTeacher':
        result = await Teacher.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }
        break

      // Salary Record operations
      case 'createSalaryRecord':
        result = await SalaryRecord.create(data)
        break

      case 'updateSalaryRecord':
        result = await SalaryRecord.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
        }
        break

      case 'deleteSalaryRecord':
        result = await SalaryRecord.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
        }
        break

      // Expense operations
      case 'createExpense':
        result = await Expense.create(data)
        break

      case 'updateExpense':
        result = await Expense.findByIdAndUpdate(id, data, { new: true })
        if (!result) {
          return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }
        break

      case 'deleteExpense':
        result = await Expense.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Fetch updated data to return
    const [students, batches, teachers, feeRecords, salaryRecords, expenses] = await Promise.all([
      Student.find({}).lean(),
      Batch.find({}).lean(),
      Teacher.find({}).lean(),
      FeeRecord.find({}).lean(),
      SalaryRecord.find({}).lean(),
      Expense.find({}).lean(),
    ])

    const dataStore = {
      students: transformDocuments(students),
      batches: transformDocuments(batches),
      teachers: transformDocuments(teachers),
      feeRecords: transformDocuments(feeRecords),
      salaryRecords: transformDocuments(salaryRecords),
      expenses: transformDocuments(expenses),
    }

    return NextResponse.json({ success: true, data: dataStore }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error in POST /api/data:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 