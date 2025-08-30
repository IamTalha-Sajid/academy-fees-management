import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create indexes for better performance
expenseSchema.index({ date: -1 })
expenseSchema.index({ amount: -1 })
expenseSchema.index({ name: 'text', description: 'text' })

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema)
