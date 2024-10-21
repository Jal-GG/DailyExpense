import mongoose from 'mongoose';
import participantSchema from '../models/Participant.js'; 

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'], 
    required: true,
  },
  participants: [participantSchema], 
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
