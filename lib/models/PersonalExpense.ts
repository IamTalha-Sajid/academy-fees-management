import mongoose from 'mongoose'

const personalExpenseSchema = new mongoose.Schema({
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
  },
  place: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
})

personalExpenseSchema.index({ date: -1 })
personalExpenseSchema.index({ amount: -1 })

export default mongoose.models.PersonalExpense || mongoose.model('PersonalExpense', personalExpenseSchema)
