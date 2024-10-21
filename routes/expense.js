import express from "express";
import { addPercentageExpense, addExactExpense, addEqualExpense, getOverallExpenses, getBalanceSheet } from "../controllers/expenseController.js";

const router = express.Router();

router.post('/add/percentage', addPercentageExpense);

router.post('/add/exact', addExactExpense);

router.post('/add/equal', addEqualExpense);

router.get('/all', getOverallExpenses);

router.get('/balance-sheet', getBalanceSheet);

export default router;
