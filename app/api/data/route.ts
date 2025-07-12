import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'lib', 'data.json')

// Helper function to read data from JSON file
function readData() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data file:', error)
    return {
      students: [],
      batches: [],
      teachers: [],
      feeRecords: [],
      salaryRecords: []
    }
  }
}

// Helper function to write data to JSON file
function writeData(data: any) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing data file:', error)
    return false
  }
}

export async function GET() {
  try {
    const data = readData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, id } = body

    const currentData = readData()

    // Ensure all required arrays exist
    if (!currentData.salaryRecords) {
      currentData.salaryRecords = []
    }

    switch (action) {
      case 'createStudent':
        const newStudent = {
          ...data,
          id: Date.now()
        }
        currentData.students.push(newStudent)
        break

      case 'updateStudent':
        const studentIndex = currentData.students.findIndex((s: any) => s.id === id)
        if (studentIndex !== -1) {
          currentData.students[studentIndex] = { ...currentData.students[studentIndex], ...data }
        }
        break

      case 'deleteStudent':
        currentData.students = currentData.students.filter((s: any) => s.id !== id)
        break

      case 'createBatch':
        const newBatch = {
          ...data,
          id: Date.now()
        }
        currentData.batches.push(newBatch)
        break

      case 'updateBatch':
        const batchIndex = currentData.batches.findIndex((b: any) => b.id === id)
        if (batchIndex !== -1) {
          currentData.batches[batchIndex] = { ...currentData.batches[batchIndex], ...data }
        }
        break

      case 'deleteBatch':
        currentData.batches = currentData.batches.filter((b: any) => b.id !== id)
        break

      case 'createFeeRecord':
        const newFeeRecord = {
          ...data,
          id: Date.now()
        }
        currentData.feeRecords.push(newFeeRecord)
        break

      case 'updateFeeRecord':
        const feeRecordIndex = currentData.feeRecords.findIndex((f: any) => f.id === id)
        if (feeRecordIndex !== -1) {
          currentData.feeRecords[feeRecordIndex] = { ...currentData.feeRecords[feeRecordIndex], ...data }
        }
        break

      case 'deleteFeeRecord':
        currentData.feeRecords = currentData.feeRecords.filter((f: any) => f.id !== id)
        break

      case 'markFeePaid':
        const feeIndex = currentData.feeRecords.findIndex((f: any) => f.id === id)
        if (feeIndex !== -1) {
          currentData.feeRecords[feeIndex] = {
            ...currentData.feeRecords[feeIndex],
            status: 'paid',
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod: data.paymentMethod || 'Cash'
          }
        }
        break

      case 'markFeePending':
        const pendingFeeIndex = currentData.feeRecords.findIndex((f: any) => f.id === id)
        if (pendingFeeIndex !== -1) {
          currentData.feeRecords[pendingFeeIndex] = {
            ...currentData.feeRecords[pendingFeeIndex],
            status: 'pending',
            paidDate: null,
            paymentMethod: null
          }
        }
        break

      case 'createTeacher':
        const newTeacher = {
          ...data,
          id: Date.now()
        }
        currentData.teachers.push(newTeacher)
        break

      case 'updateTeacher':
        const teacherIndex = currentData.teachers.findIndex((t: any) => t.id === id)
        if (teacherIndex !== -1) {
          currentData.teachers[teacherIndex] = { ...currentData.teachers[teacherIndex], ...data }
        }
        break

      case 'deleteTeacher':
        currentData.teachers = currentData.teachers.filter((t: any) => t.id !== id)
        break

      case 'createSalaryRecord':
        const newSalaryRecord = {
          ...data,
          id: Date.now()
        }
        currentData.salaryRecords.push(newSalaryRecord)
        break

      case 'updateSalaryRecord':
        const salaryRecordIndex = currentData.salaryRecords.findIndex((s: any) => s.id === id)
        if (salaryRecordIndex !== -1) {
          currentData.salaryRecords[salaryRecordIndex] = { ...currentData.salaryRecords[salaryRecordIndex], ...data }
        }
        break

      case 'deleteSalaryRecord':
        currentData.salaryRecords = currentData.salaryRecords.filter((s: any) => s.id !== id)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const success = writeData(currentData)
    if (success) {
      return NextResponse.json({ success: true, data: currentData })
    } else {
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 