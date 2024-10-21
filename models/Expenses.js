import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitType: { type: String, enum: ['equal', 'exact', 'percentage'], required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountOwed: { type: Number },
    percentage: { type: Number }
  }],
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
