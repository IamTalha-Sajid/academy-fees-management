import mongoose, { Document, Schema } from 'mongoose'

export interface IStudent extends Document {
  name: string
  batch: string
  fees: number
  contact?: string
  email?: string
  address: string
  status: 'active' | 'inactive'
  joinDate: string
  createdAt: Date
  updatedAt: Date
}

const StudentSchema = new Schema<IStudent>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  contact: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  joinDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

// Create indexes for better performance
StudentSchema.index({ name: 1 })
StudentSchema.index({ batch: 1 })
StudentSchema.index({ status: 1 })
StudentSchema.index({ email: 1 })

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema)