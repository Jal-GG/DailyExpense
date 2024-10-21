import express from "express";
import Expense from "../models/Expenses.js"; // Ensure this model is correctly set up to match the structure you need
import User from "../models/Users.js"; // Assuming you have a User model for participant validation

const router = express.Router();

// Add an expense
router.post('/add', async (req, res) => {
  try {
    const { description, amount, paidBy, splitType, participants } = req.body;

    // Validate the participants and split logic
    if (splitType === 'percentage') {
      const totalPercentage = participants.reduce((acc, curr) => acc + curr.percentage, 0);
      if (totalPercentage !== 100) {
        return res.status(400).json({ message: 'Percentages must add up to 100%' });
      }

      // Calculate exact amounts based on percentage splits
      participants.forEach(participant => {
        participant.amountOwed = (amount * participant.percentage) / 100;
      });

    } else if (splitType === 'equal') {
      // Split the amount equally among all participants
      const equalShare = amount / participants.length;
      participants.forEach(participant => {
        participant.amountOwed = equalShare;
      });

    } else if (splitType === 'exact') {
      // Validate that each participant has an exact amount owed specified
      participants.forEach(participant => {
        if (!participant.amountOwed) {
          return res.status(400).json({ message: 'Exact amounts must be specified for each participant' });
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid split type' });
    }

    const expense = new Expense({ description, amount, paidBy, splitType, participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error });
  }
});

// Get individual user expenses
router.get('/user/:userId', async (req, res) => {
  try {
    const expenses = await Expense.find({ "participants.user": req.params.userId }).populate('paidBy participants.user');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching user expenses', error });
  }
});

// Get overall expenses
router.get('/all', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy participants.user');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching expenses', error });
  }
});

// Download balance sheet (this should ideally implement CSV export)
router.get('/balance-sheet/download', async (req, res) => {
  try {
    const expenses = await Expense.find().populate('paidBy participants.user');
    // Logic to generate balance sheet and convert to CSV should be implemented here
    res.status(200).json({ message: 'Balance sheet download coming soon' });
  } catch (error) {
    res.status(400).json({ message: 'Error downloading balance sheet', error });
  }
});

export default router;
