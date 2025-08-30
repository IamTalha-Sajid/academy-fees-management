import mongoose, { Document, Schema } from 'mongoose'

export interface ISalaryRecord extends Document {
  teacherId: mongoose.Types.ObjectId
  teacherName: string
  amount: number
  month: string
  year: string
  paymentDate: string
  paymentMethod: string
  notes?: string
  type: 'full' | 'partial'
  createdAt: Date
  updatedAt: Date
}

const SalaryRecordSchema = new Schema<ISalaryRecord>({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  paymentDate: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['full', 'partial'],
    default: 'partial'
  }
}, {
  timestamps: true
})

// Create indexes for better performance
SalaryRecordSchema.index({ teacherId: 1 })
SalaryRecordSchema.index({ teacherName: 1 })
SalaryRecordSchema.index({ month: 1, year: 1 })
SalaryRecordSchema.index({ paymentDate: 1 })
SalaryRecordSchema.index({ type: 1 })

// Compound indexes for common queries
SalaryRecordSchema.index({ teacherId: 1, month: 1, year: 1 })

export default mongoose.models.SalaryRecord || mongoose.model<ISalaryRecord>('SalaryRecord', SalaryRecordSchema)