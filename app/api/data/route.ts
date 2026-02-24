import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongodb'
import Student from '@/lib/models/Student'
import Batch from '@/lib/models/Batch'
import Teacher from '@/lib/models/Teacher'
import FeeRecord from '@/lib/models/FeeRecord'
import SalaryRecord from '@/lib/models/SalaryRecord'
import Expense from '@/lib/models/Expense'
import PersonalExpense from '@/lib/models/PersonalExpense'

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
    const [students, batches, teachers, feeRecords, salaryRecords, expenses, personalExpenses] = await Promise.all([
      Student.find({}).lean(),
      Batch.find({}).lean(),
      Teacher.find({}).lean(),
      FeeRecord.find({}).lean(),
      SalaryRecord.find({}).lean(),
      Expense.find({}).lean(),
      PersonalExpense.find({}).lean(),
    ])

    // Transform the data to include id fields
    const dataStore = {
      students: transformDocuments(students),
      batches: transformDocuments(batches),
      teachers: transformDocuments(teachers),
      feeRecords: transformDocuments(feeRecords),
      salaryRecords: transformDocuments(salaryRecords),
      expenses: transformDocuments(expenses),
      personalExpenses: transformDocuments(personalExpenses),
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
        // Validate that batch exists
        if (data.batch) {
          const batchExists = await Batch.findOne({ name: data.batch })
          if (!batchExists) {
            return NextResponse.json({ 
              error: `Batch "${data.batch}" does not exist. Cannot create student with non-existent batch.`,
              invalidReference: true 
            }, { status: 400 })
          }
        }
        
        // Validate fees amount
        if (data.fees !== undefined && data.fees < 0) {
          return NextResponse.json({ 
            error: 'Fees amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status
        if (data.status && !['active', 'inactive'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "active" or "inactive"',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await Student.create(data)
        break

      case 'updateStudent':
        // Check if student exists
        const existingStudent = await Student.findById(id)
        if (!existingStudent) {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }
        
        // Validate batch if it's being changed
        if (data.batch && data.batch !== existingStudent.batch) {
          const batchExists = await Batch.findOne({ name: data.batch })
          if (!batchExists) {
            return NextResponse.json({ 
              error: `Batch "${data.batch}" does not exist. Cannot update student to non-existent batch.`,
              invalidReference: true 
            }, { status: 400 })
          }
        }
        
        // Validate fees amount if provided
        if (data.fees !== undefined && data.fees < 0) {
          return NextResponse.json({ 
            error: 'Fees amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status if provided
        if (data.status && !['active', 'inactive'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "active" or "inactive"',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await Student.findByIdAndUpdate(id, data, { new: true })
        break

      case 'deleteStudent':
        // Check if student exists
        const studentToDelete = await Student.findById(id)
        if (!studentToDelete) {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }
        
        // Use transaction for atomic cascade delete
        const session = await mongoose.startSession()
        try {
          await session.withTransaction(async () => {
            // Cascade delete: Remove all fee records for this student
            await FeeRecord.deleteMany({ studentId: id }).session(session)
            
            // Delete the student
            result = await Student.findByIdAndDelete(id).session(session)
          })
        } catch (transactionError) {
          console.error('Transaction error during student deletion:', transactionError)
          throw transactionError
        } finally {
          await session.endSession()
        }
        break

      // Batch operations
      case 'createBatch':
        result = await Batch.create(data)
        break

      case 'updateBatch':
        // Check if batch exists
        const existingBatch = await Batch.findById(id)
        if (!existingBatch) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }
        
        // Validate fees amount if provided
        if (data.fees !== undefined && data.fees < 0) {
          return NextResponse.json({ 
            error: 'Batch fees cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate students count if provided
        if (data.students !== undefined && data.students < 0) {
          return NextResponse.json({ 
            error: 'Student count cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status if provided
        if (data.status && !['active', 'inactive'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "active" or "inactive"',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate unique name if it's being changed
        if (data.name && data.name !== existingBatch.name) {
          const nameExists = await Batch.findOne({ name: data.name })
          if (nameExists) {
            return NextResponse.json({ 
              error: `Batch with name "${data.name}" already exists`,
              duplicate: true 
            }, { status: 409 })
          }
        }
        
        result = await Batch.findByIdAndUpdate(id, data, { new: true })
        break

      case 'deleteBatch':
        // Check if batch exists
        const batchToDelete = await Batch.findById(id)
        if (!batchToDelete) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }
        
        // Check if any students still reference this batch
        const studentsWithBatch = await Student.countDocuments({ batch: batchToDelete.name, status: 'active' })
        if (studentsWithBatch > 0) {
          return NextResponse.json({ 
            error: `Cannot delete batch. ${studentsWithBatch} active student(s) still assigned to this batch. Please reassign or deactivate students first.`,
            hasReferences: true,
            referenceCount: studentsWithBatch
          }, { status: 409 })
        }
        
        // Check if any teachers still reference this batch
        const teachersWithBatch = await Teacher.countDocuments({ batch: batchToDelete.name, status: 'active' })
        if (teachersWithBatch > 0) {
          return NextResponse.json({ 
            error: `Cannot delete batch. ${teachersWithBatch} active teacher(s) still assigned to this batch. Please reassign or deactivate teachers first.`,
            hasReferences: true,
            referenceCount: teachersWithBatch
          }, { status: 409 })
        }
        
        // Note: We allow deletion even if inactive students/teachers reference it
        // This preserves historical data while preventing active data corruption
        
        // Delete the batch
        result = await Batch.findByIdAndDelete(id)
        break

      // Fee Record operations
      case 'createFeeRecord':
        // Validate that student exists
        const studentExists = await Student.findById(data.studentId)
        if (!studentExists) {
          return NextResponse.json({ 
            error: 'Student not found. Cannot create fee record for non-existent student.',
            invalidReference: true 
          }, { status: 404 })
        }
        
        // Check for duplicate fee record before creating
        const existingFeeRecord = await FeeRecord.findOne({
          studentId: data.studentId,
          month: data.month,
          year: data.year
        })
        
        if (existingFeeRecord) {
          return NextResponse.json({ 
            error: 'Fee record already exists for this student, month, and year',
            duplicate: true 
          }, { status: 409 })
        }
        
        result = await FeeRecord.create(data)
        break

      case 'updateFeeRecord':
        // Check if fee record exists
        const existingFeeRecordForUpdate = await FeeRecord.findById(id)
        if (!existingFeeRecordForUpdate) {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        
        // Validate studentId if it's being changed
        if (data.studentId && data.studentId !== existingFeeRecordForUpdate.studentId.toString()) {
          const studentExists = await Student.findById(data.studentId)
          if (!studentExists) {
            return NextResponse.json({ 
              error: 'Student not found. Cannot update fee record to reference non-existent student.',
              invalidReference: true 
            }, { status: 404 })
          }
        }
        
        // Validate amount if provided
        if (data.amount !== undefined && data.amount < 0) {
          return NextResponse.json({ 
            error: 'Fee amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status if provided
        if (data.status && !['paid', 'pending', 'overdue'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "paid", "pending", or "overdue"',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate payment method if provided
        if (data.paymentMethod && !['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'].includes(data.paymentMethod)) {
          return NextResponse.json({ 
            error: 'Invalid payment method',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Check for duplicate if studentId, month, or year is being changed
        if (data.studentId || data.month || data.year) {
          const newStudentId = data.studentId || existingFeeRecordForUpdate.studentId.toString()
          const newMonth = data.month || existingFeeRecordForUpdate.month
          const newYear = data.year || existingFeeRecordForUpdate.year
          
          // Only check for duplicate if it's different from current values
          if (newStudentId !== existingFeeRecordForUpdate.studentId.toString() || 
              newMonth !== existingFeeRecordForUpdate.month || 
              newYear !== existingFeeRecordForUpdate.year) {
            const duplicateCheck = await FeeRecord.findOne({
              studentId: newStudentId,
              month: newMonth,
              year: newYear,
              _id: { $ne: id } // Exclude current record
            })
            
            if (duplicateCheck) {
              return NextResponse.json({ 
                error: 'Fee record already exists for this student, month, and year',
                duplicate: true 
              }, { status: 409 })
            }
          }
        }
        
        result = await FeeRecord.findByIdAndUpdate(id, data, { new: true })
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
        // Validate that batch exists
        if (data.batch) {
          const batchExists = await Batch.findOne({ name: data.batch })
          if (!batchExists) {
            return NextResponse.json({ 
              error: `Batch "${data.batch}" does not exist. Cannot create teacher with non-existent batch.`,
              invalidReference: true 
            }, { status: 400 })
          }
        }
        
        // Validate salary amount
        if (data.salary !== undefined && data.salary < 0) {
          return NextResponse.json({ 
            error: 'Salary amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status
        if (data.status && !['active', 'inactive'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "active" or "inactive"',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await Teacher.create(data)
        break

      case 'updateTeacher':
        // Check if teacher exists
        const existingTeacher = await Teacher.findById(id)
        if (!existingTeacher) {
          return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }
        
        // Validate batch if it's being changed
        if (data.batch && data.batch !== existingTeacher.batch) {
          const batchExists = await Batch.findOne({ name: data.batch })
          if (!batchExists) {
            return NextResponse.json({ 
              error: `Batch "${data.batch}" does not exist. Cannot update teacher to non-existent batch.`,
              invalidReference: true 
            }, { status: 400 })
          }
        }
        
        // Validate salary amount if provided
        if (data.salary !== undefined && data.salary < 0) {
          return NextResponse.json({ 
            error: 'Salary amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate status if provided
        if (data.status && !['active', 'inactive'].includes(data.status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be "active" or "inactive"',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await Teacher.findByIdAndUpdate(id, data, { new: true })
        break

      case 'deleteTeacher':
        // Check if teacher exists
        const teacherToDelete = await Teacher.findById(id)
        if (!teacherToDelete) {
          return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }
        
        // Use transaction for atomic cascade delete
        const teacherSession = await mongoose.startSession()
        try {
          await teacherSession.withTransaction(async () => {
            // Cascade delete: Remove all salary records for this teacher
            await SalaryRecord.deleteMany({ teacherId: id }).session(teacherSession)
            
            // Delete the teacher
            result = await Teacher.findByIdAndDelete(id).session(teacherSession)
          })
        } catch (transactionError) {
          console.error('Transaction error during teacher deletion:', transactionError)
          throw transactionError
        } finally {
          await teacherSession.endSession()
        }
        break

      // Salary Record operations
      case 'createSalaryRecord':
        // Validate that teacher exists
        const teacherExists = await Teacher.findById(data.teacherId)
        if (!teacherExists) {
          return NextResponse.json({ 
            error: 'Teacher not found. Cannot create salary record for non-existent teacher.',
            invalidReference: true 
          }, { status: 404 })
        }
        
        result = await SalaryRecord.create(data)
        break

      case 'updateSalaryRecord':
        // Check if salary record exists
        const existingSalaryRecord = await SalaryRecord.findById(id)
        if (!existingSalaryRecord) {
          return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
        }
        
        // Validate teacherId if it's being changed
        if (data.teacherId && data.teacherId !== existingSalaryRecord.teacherId.toString()) {
          const teacherExists = await Teacher.findById(data.teacherId)
          if (!teacherExists) {
            return NextResponse.json({ 
              error: 'Teacher not found. Cannot update salary record to reference non-existent teacher.',
              invalidReference: true 
            }, { status: 404 })
          }
        }
        
        // Validate amount if provided
        if (data.amount !== undefined && data.amount < 0) {
          return NextResponse.json({ 
            error: 'Salary amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate payment method if provided
        if (data.paymentMethod && !['Cash', 'Bank Transfer', 'Cheque', 'UPI'].includes(data.paymentMethod)) {
          return NextResponse.json({ 
            error: 'Invalid payment method',
            invalidData: true 
          }, { status: 400 })
        }
        
        // Validate type if provided
        if (data.type && !['full', 'partial'].includes(data.type)) {
          return NextResponse.json({ 
            error: 'Invalid type. Must be "full" or "partial"',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await SalaryRecord.findByIdAndUpdate(id, data, { new: true })
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
        // Check if expense exists
        const existingExpense = await Expense.findById(id)
        if (!existingExpense) {
          return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }
        
        // Validate amount if provided
        if (data.amount !== undefined && data.amount < 0) {
          return NextResponse.json({ 
            error: 'Expense amount cannot be negative',
            invalidData: true 
          }, { status: 400 })
        }
        
        result = await Expense.findByIdAndUpdate(id, data, { new: true })
        break

      case 'deleteExpense':
        result = await Expense.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }
        break

      // Personal Expense operations
      case 'createPersonalExpense':
        if (data.amount !== undefined && data.amount < 0) {
          return NextResponse.json({
            error: 'Amount cannot be negative',
            invalidData: true
          }, { status: 400 })
        }
        result = await PersonalExpense.create(data)
        break

      case 'updatePersonalExpense': {
        const existingPersonalExpense = await PersonalExpense.findById(id)
        if (!existingPersonalExpense) {
          return NextResponse.json({ error: 'Personal expense not found' }, { status: 404 })
        }
        if (data.amount !== undefined && data.amount < 0) {
          return NextResponse.json({
            error: 'Amount cannot be negative',
            invalidData: true
          }, { status: 400 })
        }
        result = await PersonalExpense.findByIdAndUpdate(id, data, { new: true })
        break
      }

      case 'deletePersonalExpense':
        result = await PersonalExpense.findByIdAndDelete(id)
        if (!result) {
          return NextResponse.json({ error: 'Personal expense not found' }, { status: 404 })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Fetch updated data to return
    const [students, batches, teachers, feeRecords, salaryRecords, expenses, personalExpenses] = await Promise.all([
      Student.find({}).lean(),
      Batch.find({}).lean(),
      Teacher.find({}).lean(),
      FeeRecord.find({}).lean(),
      SalaryRecord.find({}).lean(),
      Expense.find({}).lean(),
      PersonalExpense.find({}).lean(),
    ])

    const dataStore = {
      students: transformDocuments(students),
      batches: transformDocuments(batches),
      teachers: transformDocuments(teachers),
      feeRecords: transformDocuments(feeRecords),
      salaryRecords: transformDocuments(salaryRecords),
      expenses: transformDocuments(expenses),
      personalExpenses: transformDocuments(personalExpenses),
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