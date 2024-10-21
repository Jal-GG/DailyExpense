import express from "express";
import { addPercentageExpense, addExactExpense, addEqualExpense, getOverallExpenses, getBalanceSheet } from "../controllers/expenseController.js";

const router = express.Router();

// Add an expense with percentage split
router.post('/add/percentage', addPercentageExpense);

// Add an expense with exact amounts
router.post('/add/exact', addExactExpense);

// Add an expense with equal split
router.post('/add/equal', addEqualExpense);

// Get overall expenses
router.get('/all', getOverallExpenses);

// Get balance sheet
router.get('/balance-sheet', getBalanceSheet);

export default router;
