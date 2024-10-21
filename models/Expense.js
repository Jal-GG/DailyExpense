import mongoose from 'mongoose';
import participantSchema from '../models/Participant.js'; // Ensure this is the correct path

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
    ref: 'User', // Reference to User model
    required: true,
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'], // Allowed split types
    required: true,
  },
  participants: [participantSchema], // Array of participants
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
