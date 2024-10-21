import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  amountOwed: {
    type: Number,
    required: true,
  },
}, { _id: false });

export default participantSchema; // Export the schema, not the model
