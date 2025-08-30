import mongoose, { Document, Schema } from 'mongoose'

export interface IBatch extends Document {
  name: string
  teacher: string
  students: number
  fees: number
  schedule: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const BatchSchema = new Schema<IBatch>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  teacher: {
    type: String,
    required: true,
    trim: true
  },
  students: {
    type: Number,
    default: 0,
    min: 0
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  schedule: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
})

// Create indexes for better performance
BatchSchema.index({ name: 1 })
BatchSchema.index({ teacher: 1 })
BatchSchema.index({ status: 1 })

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema)