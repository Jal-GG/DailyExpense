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

    const equalShare = amount / participants.length;
    participants.forEach(participant => {
      participant.amountOwed = equalShare;
    });

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
    const { description, amount, participants } = req.body; 

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    const errors = [];
    participants.forEach(participant => {
      if (participant.amountOwed === undefined) {
        errors.push('Exact amounts must be specified for each participant');
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }

    const totalOwed = participants.reduce((acc, curr) => acc + curr.amountOwed, 0);
    if (totalOwed !== amount) {
      return res.status(400).json({ message: 'The total amount owed by participants must equal the total expense amount.' });
    }

    const paidBy = req.user.id; 

    const expense = new Expense({ description, amount, paidBy, splitType: 'exact', participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });

  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error: error.message });
  }
};

  
export const addPercentageExpense = async (req, res) => {
  try {
    const { description, amount, participants } = req.body; 

    if (!participants || participants.length === 0) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    const errors = [];
    participants.forEach(participant => {
      if (!participant.user) {
        errors.push('Each participant must have a user ID specified');
      }
      if (participant.percentage === undefined) {
        errors.push('Each participant must have a percentage share specified');
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }

    const totalPercentage = participants.reduce((acc, curr) => acc + curr.percentage, 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({ message: 'Percentages must add up to 100%' });
    }

    participants.forEach(participant => {
      participant.amountOwed = (amount * participant.percentage) / 100;
    });

    const paidBy = req.user.id;

    const expense = new Expense({ description, amount, paidBy, splitType: 'percentage', participants });
    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });

  } catch (error) {
    res.status(400).json({ message: 'Error adding expense', error: error.message });
  }
};


export const getOverallExpenses = async (req, res) => {
  try {
    
    const expenses = await Expense.find().populate('paidBy participants.user');

    if (expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found' });
    }

    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

    const userOwes = {};

    expenses.forEach(expense => {
      expense.participants.forEach(participant => {
        const userId = participant.user._id.toString(); 

        
        if (expense.splitType === 'equal') {
         
          userOwes[userId] = (userOwes[userId] || 0) + (expense.amount / expense.participants.length);
        } else if (expense.splitType === 'exact') {
        
          userOwes[userId] = (userOwes[userId] || 0) + participant.amountOwed;
        } else if (expense.splitType === 'percentage') {
       
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
    console.error('Error fetching expenses:', error); 
    res.status(400).json({ message: 'Error fetching expenses', error: error.message });
  }
};


export const getBalanceSheet = async (req, res) => {
    try {
      const expenses = await Expense.find().populate('paidBy participants.user');
  
      const balanceSheet = {};
      let totalExpense = 0;
  
      expenses.forEach(expense => {
        totalExpense += expense.amount;
  
        const payerId = expense.paidBy._id.toString();
        if (!balanceSheet[payerId]) {
          balanceSheet[payerId] = {
            name: expense.paidBy.name,
            totalOwed: 0,
            totalPaid: 0
          };
        }
        balanceSheet[payerId].totalPaid += expense.amount; 
        expense.participants.forEach(participant => {
          const userId = participant.user._id.toString();
  
          if (!balanceSheet[userId]) {
            balanceSheet[userId] = {
              name: participant.user.name,
              totalOwed: 0,
              totalPaid: 0
            };
          }
  
        
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
  