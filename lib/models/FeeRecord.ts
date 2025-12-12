import mongoose, { Document, Schema } from 'mongoose'

export interface IFeeRecord extends Document {
  studentId: mongoose.Types.ObjectId
  studentName: string
  batch: string
  amount: number
  month: string
  year: string
  status: 'paid' | 'pending' | 'overdue'
  paidDate: string | null
  paymentMethod: string | null
  createdAt: Date
  updatedAt: Date
}

const FeeRecordSchema = new Schema<IFeeRecord>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
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
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  paidDate: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'],
    default: null
  }
}, {
  timestamps: true
})

// Create indexes for better performance
FeeRecordSchema.index({ studentId: 1 })
FeeRecordSchema.index({ studentName: 1 })
FeeRecordSchema.index({ batch: 1 })
FeeRecordSchema.index({ month: 1, year: 1 })
FeeRecordSchema.index({ status: 1 })
FeeRecordSchema.index({ paidDate: 1 })

// Compound indexes for common queries
// Unique compound index to prevent duplicate fee records for the same student, month, and year
FeeRecordSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true })
FeeRecordSchema.index({ batch: 1, month: 1, year: 1 })

export default mongoose.models.FeeRecord || mongoose.model<IFeeRecord>('FeeRecord', FeeRecordSchema)