import mongoose, { Document, Schema } from 'mongoose'

export interface ITeacher extends Document {
  name: string
  subject: string
  contact?: string
  email?: string
  batch: string
  salary: number
  joinDate: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const TeacherSchema = new Schema<ITeacher>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
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
  batch: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  joinDate: {
    type: String,
    required: true
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
TeacherSchema.index({ name: 1 })
TeacherSchema.index({ subject: 1 })
TeacherSchema.index({ batch: 1 })
TeacherSchema.index({ status: 1 })
TeacherSchema.index({ email: 1 })

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema)