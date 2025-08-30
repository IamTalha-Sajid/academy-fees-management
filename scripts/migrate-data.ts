/**
 * Data Migration Script
 * Run this script to migrate initial data to MongoDB
 * 
 * Usage: npx ts-node scripts/migrate-data.ts
 */

import mongoose from 'mongoose'
import connectToDatabase from '../lib/mongodb'
import Student from '../lib/models/Student'
import Batch from '../lib/models/Batch'
import Teacher from '../lib/models/Teacher'
import FeeRecord from '../lib/models/FeeRecord'
import SalaryRecord from '../lib/models/SalaryRecord'

// Initial data from the old in-memory storage
const initialData = {
  students: [
    {
      name: "Talha Sajid",
      batch: "Class 9",
      fees: 800,
      contact: "asasd",
      email: "iam@ia.cm",
      address: "adssda",
      status: "active",
      joinDate: "2025-07-12"
    },
    {
      name: "Naeem",
      batch: "Class 9",
      fees: 700,
      contact: "98769",
      email: "iam@ia.cm",
      address: "Chak No 97/WB Tehsil & District Vehari",
      status: "active",
      joinDate: "2025-07-12"
    }
  ],
  batches: [
    {
      name: "Class 9",
      teacher: "Ali ",
      students: 10,
      fees: 500,
      schedule: "Monday to Friday, 8:00 AM - 2:00 PM",
      status: "active"
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
      joinDate: "2025-07-12"
    }
  ]
}

async function migrateData() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await connectToDatabase()

    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      Student.deleteMany({}),
      Batch.deleteMany({}),
      Teacher.deleteMany({}),
      FeeRecord.deleteMany({}),
      SalaryRecord.deleteMany({})
    ])

    console.log('📚 Creating batches...')
    const createdBatches = await Batch.insertMany(initialData.batches)
    console.log(`✅ Created ${createdBatches.length} batches`)

    console.log('👩‍🏫 Creating teachers...')
    const createdTeachers = await Teacher.insertMany(initialData.teachers)
    console.log(`✅ Created ${createdTeachers.length} teachers`)

    console.log('👥 Creating students...')
    const createdStudents = await Student.insertMany(initialData.students)
    console.log(`✅ Created ${createdStudents.length} students`)

    console.log('💰 Creating sample fee records...')
    // Create fee records for the students
    const feeRecords = [
      {
        studentId: createdStudents[0]._id,
        studentName: createdStudents[0].name,
        batch: createdStudents[0].batch,
        amount: createdStudents[0].fees,
        month: "July",
        year: "2025",
        status: "paid",
        paidDate: "2025-07-12",
        paymentMethod: "Cash"
      },
      {
        studentId: createdStudents[1]._id,
        studentName: createdStudents[1].name,
        batch: createdStudents[1].batch,
        amount: createdStudents[1].fees,
        month: "July",
        year: "2025",
        status: "pending",
        paidDate: null,
        paymentMethod: null
      }
    ]
    const createdFeeRecords = await FeeRecord.insertMany(feeRecords)
    console.log(`✅ Created ${createdFeeRecords.length} fee records`)

    console.log('💵 Creating sample salary records...')
    // Create salary records for the teachers
    const salaryRecords = [
      {
        teacherId: createdTeachers[0]._id,
        teacherName: createdTeachers[0].name,
        amount: 10000,
        month: "July",
        year: "2025",
        paymentDate: "2025-07-12",
        paymentMethod: "Cash",
        notes: "",
        type: "partial"
      }
    ]
    const createdSalaryRecords = await SalaryRecord.insertMany(salaryRecords)
    console.log(`✅ Created ${createdSalaryRecords.length} salary records`)

    console.log('\n🎉 Data migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Students: ${createdStudents.length}`)
    console.log(`   - Batches: ${createdBatches.length}`)
    console.log(`   - Teachers: ${createdTeachers.length}`)
    console.log(`   - Fee Records: ${createdFeeRecords.length}`)
    console.log(`   - Salary Records: ${createdSalaryRecords.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('📡 Database connection closed')
    process.exit(0)
  }
}

// Run the migration
migrateData()