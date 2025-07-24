import { NextRequest, NextResponse } from 'next/server'

// In-memory data storage for serverless environment
let dataStore = {
  students: [
    {
      name: "Talha Sajid",
      batch: "Class 9",
      fees: 800,
      contact: "asasd",
      email: "iam@ia.cm",
      address: "adssda",
      status: "active",
      joinDate: "2025-07-12",
      id: 1752328905781
    },
    {
      name: "Naeem",
      batch: "Class 9",
      fees: 700,
      contact: "98769",
      email: "iam@ia.cm",
      address: "Chak No 97/WB Tehsil & District Vehari",
      status: "active",
      joinDate: "2025-07-12",
      id: 1752329607038
    }
  ],
  batches: [
    {
      name: "Class 9",
      teacher: "Ali ",
      students: 10,
      fees: 500,
      schedule: "Monday to Friday, 8:00 AM - 2:00 PM",
      status: "active",
      id: 1752328855341
    }
  ],
  teachers: [
    {
      name: "Ali",
      subject: "Mathematics",
      contact: "",
      email: "",
      batch: "Class 9-B",
      salary: 90000,
      status: "active",
      joinDate: "2025-07-12",
      id: 1752333633580
    }
  ],
  feeRecords: [
    {
      studentId: 1752328905781,
      studentName: "Talha Sajid",
      batch: "Class 9",
      amount: 800,
      month: "July",
      year: "2025",
      status: "paid",
      paidDate: "2025-07-12",
      paymentMethod: "Cash",
      id: 1752330508405
    },
    {
      studentId: 1752329607038,
      studentName: "Naeem",
      batch: "Class 9",
      amount: 700,
      month: "July",
      year: "2025",
      status: "pending",
      paidDate: null,
      paymentMethod: null,
      id: 1752330508616
    }
  ],
  salaryRecords: [
    {
      teacherId: 1752333633580,
      teacherName: "Ali",
      amount: 10000,
      month: "July",
      year: "2025",
      paymentDate: "2025-07-12",
      paymentMethod: "Cash",
      notes: "",
      type: "partial",
      id: 1752333903746
    }
  ]
}

export async function GET() {
  try {
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
    const body = await request.json()
    const { action, data, id } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    switch (action) {
      case 'createStudent':
        const newStudent = {
          ...data,
          id: Date.now()
        }
        dataStore.students.push(newStudent)
        break

      case 'updateStudent':
        const studentIndex = dataStore.students.findIndex((s: any) => s.id === id)
        if (studentIndex !== -1) {
          dataStore.students[studentIndex] = { ...dataStore.students[studentIndex], ...data }
        } else {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }
        break

      case 'deleteStudent':
        dataStore.students = dataStore.students.filter((s: any) => s.id !== id)
        break

      case 'createBatch':
        const newBatch = {
          ...data,
          id: Date.now()
        }
        dataStore.batches.push(newBatch)
        break

      case 'updateBatch':
        const batchIndex = dataStore.batches.findIndex((b: any) => b.id === id)
        if (batchIndex !== -1) {
          dataStore.batches[batchIndex] = { ...dataStore.batches[batchIndex], ...data }
        } else {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }
        break

      case 'deleteBatch':
        dataStore.batches = dataStore.batches.filter((b: any) => b.id !== id)
        break

      case 'createFeeRecord':
        const newFeeRecord = {
          ...data,
          id: Date.now()
        }
        dataStore.feeRecords.push(newFeeRecord)
        break

      case 'updateFeeRecord':
        const feeRecordIndex = dataStore.feeRecords.findIndex((f: any) => f.id === id)
        if (feeRecordIndex !== -1) {
          dataStore.feeRecords[feeRecordIndex] = { ...dataStore.feeRecords[feeRecordIndex], ...data }
        } else {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'deleteFeeRecord':
        dataStore.feeRecords = dataStore.feeRecords.filter((f: any) => f.id !== id)
        break

      case 'markFeePaid':
        const feeIndex = dataStore.feeRecords.findIndex((f: any) => f.id === id)
        if (feeIndex !== -1) {
          dataStore.feeRecords[feeIndex] = {
            ...dataStore.feeRecords[feeIndex],
            status: 'paid',
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod: data.paymentMethod || 'Cash'
          }
        } else {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'markFeePending':
        const pendingFeeIndex = dataStore.feeRecords.findIndex((f: any) => f.id === id)
        if (pendingFeeIndex !== -1) {
          dataStore.feeRecords[pendingFeeIndex] = {
            ...dataStore.feeRecords[pendingFeeIndex],
            status: 'pending',
            paidDate: null,
            paymentMethod: null
          }
        } else {
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        }
        break

      case 'createTeacher':
        const newTeacher = {
          ...data,
          id: Date.now()
        }
        dataStore.teachers.push(newTeacher)
        break

      case 'updateTeacher':
        const teacherIndex = dataStore.teachers.findIndex((t: any) => t.id === id)
        if (teacherIndex !== -1) {
          dataStore.teachers[teacherIndex] = { ...dataStore.teachers[teacherIndex], ...data }
        } else {
          return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }
        break

      case 'deleteTeacher':
        dataStore.teachers = dataStore.teachers.filter((t: any) => t.id !== id)
        break

      case 'createSalaryRecord':
        const newSalaryRecord = {
          ...data,
          id: Date.now()
        }
        dataStore.salaryRecords.push(newSalaryRecord)
        break

      case 'updateSalaryRecord':
        const salaryRecordIndex = dataStore.salaryRecords.findIndex((s: any) => s.id === id)
        if (salaryRecordIndex !== -1) {
          dataStore.salaryRecords[salaryRecordIndex] = { ...dataStore.salaryRecords[salaryRecordIndex], ...data }
        } else {
          return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
        }
        break

      case 'deleteSalaryRecord':
        dataStore.salaryRecords = dataStore.salaryRecords.filter((s: any) => s.id !== id)
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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