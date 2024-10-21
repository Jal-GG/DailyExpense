import Expense from "../models/Expense.js";
import User from "../models/Users.js"; 
import participant from "../models/Participant.js"

export const addEqualExpense = async (req, res) => {
  try {
    const { description, amount, participants } = req.body;

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    // Validate that each participant has a user ID specified
    participants.forEach(participant => {
      if (!participant.user) {
        return res.status(400).json({ message: 'Each participant must have a user ID specified' });
      }
    });

    // Calculate the equal share for each participant
    const equalShare = amount / participants.length;
    participants.forEach(participant => {
      participant.amountOwed = equalShare;
    });

    // Get the user ID from the authenticated user
    const paidBy = req.user.id; // The user who is authenticated

    const expense = new Expense({ description, amount, paidBy, splitType: 'equal', participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });

  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error: error.message });
  }
};

  
export const addExactExpense = async (req, res) => {
  try {
    const { description, amount, participants } = req.body; // Removed paidBy from here

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    // Validate that each participant has an exact amount owed specified
    const errors = [];
    participants.forEach(participant => {
      if (participant.amountOwed === undefined) {
        errors.push('Exact amounts must be specified for each participant');
      }
    });

    // Check if there are any validation errors
    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }

    // Optionally validate total amounts
    const totalOwed = participants.reduce((acc, curr) => acc + curr.amountOwed, 0);
    if (totalOwed !== amount) {
      return res.status(400).json({ message: 'The total amount owed by participants must equal the total expense amount.' });
    }

    // Get the user ID from the authenticated user
    const paidBy = req.user.id; // The user who is authenticated

    const expense = new Expense({ description, amount, paidBy, splitType: 'exact', participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });

  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error: error.message });
  }
};

  
export const addPercentageExpense = async (req, res) => {
  try {
    const { description, amount, participants } = req.body; // Removed paidBy from here

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    // Validate that each participant has a user ID and percentage specified
    const errors = [];
    participants.forEach(participant => {
      if (!participant.user) {
        errors.push('Each participant must have a user ID specified');
      }
      if (participant.percentage === undefined) {
        errors.push('Each participant must have a percentage share specified');
      }
    });

    // Check if there are errors in participant data
    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }

    // Validate the total percentage
    const totalPercentage = participants.reduce((acc, curr) => acc + curr.percentage, 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({ message: 'Percentages must add up to 100%' });
    }

    // Calculate how much each participant owes
    participants.forEach(participant => {
      participant.amountOwed = (amount * participant.percentage) / 100;
    });

    // Get the user ID from the authenticated user
    const paidBy = req.user.id; // The user who is authenticated

    const expense = new Expense({ description, amount, paidBy, splitType: 'percentage', participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });

  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error: error.message });
  }
};


export const getOverallExpenses = async (req, res) => {
  try {
    // Ensure user is authenticated (optional)
    // const userId = req.user.id; // Assuming you have a way to get the logged-in user's ID from the request

    // Fetch all expenses and populate relevant fields
    const expenses = await Expense.find().populate('paidBy participants.user');

    // Check if expenses are empty
    if (expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found' });
    }

    // Calculate total expenses and how much each participant owes
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

    // Create a map to track how much each user owes
    const userOwes = {};

    expenses.forEach(expense => {
      expense.participants.forEach(participant => {
        const userId = participant.user._id.toString(); // Get the user ID

        // Calculate amount owed based on the split type
        if (expense.splitType === 'equal') {
          // For equal split
          userOwes[userId] = (userOwes[userId] || 0) + (expense.amount / expense.participants.length);
        } else if (expense.splitType === 'exact') {
          // For exact amounts
          userOwes[userId] = (userOwes[userId] || 0) + participant.amountOwed;
        } else if (expense.splitType === 'percentage') {
          // For percentage splits
          userOwes[userId] = (userOwes[userId] || 0) + (expense.amount * (participant.percentage / 100));
        }
      });
    });

    res.status(200).json({
      totalExpenses,
      expenses,
      userOwes,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error); // Log error for debugging
    res.status(400).json({ message: 'Error fetching expenses', error: error.message });
  }
};


export const getBalanceSheet = async (req, res) => {
    try {
      const expenses = await Expense.find().populate('paidBy participants.user');
  
      // Initialize balance sheet
      const balanceSheet = {};
      let totalExpense = 0;
  
      // Calculate totals and balances
      expenses.forEach(expense => {
        totalExpense += expense.amount;
  
        // Update the total paid by the one who paid the expense
        const payerId = expense.paidBy._id.toString(); // Get the ID of the user who paid
        if (!balanceSheet[payerId]) {
          balanceSheet[payerId] = {
            name: expense.paidBy.name,
            totalOwed: 0,
            totalPaid: 0
          };
        }
        balanceSheet[payerId].totalPaid += expense.amount; // Assuming the total amount paid by the payer is the expense amount
  
        expense.participants.forEach(participant => {
          const userId = participant.user._id.toString();
  
          // Initialize the user's entry if it doesn't exist
          if (!balanceSheet[userId]) {
            balanceSheet[userId] = {
              name: participant.user.name,
              totalOwed: 0,
              totalPaid: 0
            };
          }
  
          // Update total owed by each participant
          if (participant.amountOwed) {
            balanceSheet[userId].totalOwed += participant.amountOwed;
          }
        });
      });
  
      res.status(200).json({ totalExpense, balanceSheet });
    } catch (error) {
      res.status(400).json({ message: 'Error generating balance sheet', error });
    }
  };
  