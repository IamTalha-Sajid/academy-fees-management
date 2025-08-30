/**
 * Data Migration Script (JavaScript version)
 * Run this script to migrate initial data to MongoDB Atlas
 * 
 * Usage: node scripts/migrate-data.js
 */

const mongoose = require('mongoose');

// MongoDB connection string from environment or direct
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://iamtalhasajid:TalhaKing69@cluster0.7pa4z7f.mongodb.net/academy-fees-management?retryWrites=true&w=majority';

// Simple schemas without imports
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batch: { type: String, required: true },
  fees: { type: Number, required: true },
  contact: String,
  email: String,
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: String, required: true }
}, { timestamps: true });

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  teacher: { type: String, required: true },
  students: { type: Number, default: 0 },
  fees: { type: Number, required: true },
  schedule: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  contact: String,
  email: String,
  batch: { type: String, required: true },
  salary: { type: Number, required: true },
  joinDate: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const FeeRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  batch: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  paidDate: { type: String, default: null },
  paymentMethod: { type: String, default: null }
}, { timestamps: true });

const SalaryRecordSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  teacherName: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  paymentDate: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  notes: String,
  type: { type: String, enum: ['full', 'partial'], default: 'partial' }
}, { timestamps: true });

// Create models
const Student = mongoose.model('Student', StudentSchema);
const Batch = mongoose.model('Batch', BatchSchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);
const FeeRecord = mongoose.model('FeeRecord', FeeRecordSchema);
const SalaryRecord = mongoose.model('SalaryRecord', SalaryRecordSchema);

// Initial data
const initialData = {
  students: [
    {
      name: "Talha Sajid",
      batch: "Class 9",
      fees: 800,
      contact: "03001234567",
      email: "talha@example.com",
      address: "Lahore, Pakistan",
      status: "active",
      joinDate: "2025-01-01"
    },
    {
      name: "Naeem Ahmed",
      batch: "Class 9",
      fees: 700,
      contact: "03009876543",
      email: "naeem@example.com",
      address: "Chak No 97/WB Tehsil & District Vehari",
      status: "active",
      joinDate: "2025-01-01"
    }
  ],
  batches: [
    {
      name: "Class 9",
      teacher: "Ali Hassan",
      students: 25,
      fees: 750,
      schedule: "Monday to Friday, 8:00 AM - 2:00 PM",
      status: "active"
    }
  ],
  teachers: [
    {
      name: "Ali Hassan",
      subject: "Mathematics",
      contact: "03001111111",
      email: "ali@universalacademy.edu",
      batch: "Class 9",
      salary: 90000,
      status: "active",
      joinDate: "2024-08-01"
    }
  ]
};

async function migrateData() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Student.deleteMany({}),
      Batch.deleteMany({}),
      Teacher.deleteMany({}),
      FeeRecord.deleteMany({}),
      SalaryRecord.deleteMany({})
    ]);

    console.log('📚 Creating batches...');
    const createdBatches = await Batch.insertMany(initialData.batches);
    console.log(`✅ Created ${createdBatches.length} batches`);

    console.log('👩‍🏫 Creating teachers...');
    const createdTeachers = await Teacher.insertMany(initialData.teachers);
    console.log(`✅ Created ${createdTeachers.length} teachers`);

    console.log('👥 Creating students...');
    const createdStudents = await Student.insertMany(initialData.students);
    console.log(`✅ Created ${createdStudents.length} students`);

    console.log('💰 Creating sample fee records...');
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();

    const feeRecords = createdStudents.map((student, index) => ({
      studentId: student._id,
      studentName: student.name,
      batch: student.batch,
      amount: student.fees,
      month: currentMonth,
      year: currentYear,
      status: index === 0 ? 'paid' : 'pending',
      paidDate: index === 0 ? currentDate.toISOString().split('T')[0] : null,
      paymentMethod: index === 0 ? 'Cash' : null
    }));

    const createdFeeRecords = await FeeRecord.insertMany(feeRecords);
    console.log(`✅ Created ${createdFeeRecords.length} fee records`);

    console.log('💵 Creating sample salary records...');
    const salaryRecords = createdTeachers.map(teacher => ({
      teacherId: teacher._id,
      teacherName: teacher.name,
      amount: 15000,
      month: currentMonth,
      year: currentYear,
      paymentDate: currentDate.toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      notes: 'Partial salary payment',
      type: 'partial'
    }));

    const createdSalaryRecords = await SalaryRecord.insertMany(salaryRecords);
    console.log(`✅ Created ${createdSalaryRecords.length} salary records`);

    console.log('\n🎉 Data migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Students: ${createdStudents.length}`);
    console.log(`   - Batches: ${createdBatches.length}`);
    console.log(`   - Teachers: ${createdTeachers.length}`);
    console.log(`   - Fee Records: ${createdFeeRecords.length}`);
    console.log(`   - Salary Records: ${createdSalaryRecords.length}`);
    console.log('\n🚀 Your application should now work properly!');
    console.log('Visit: http://localhost:3000');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the migration
migrateData();