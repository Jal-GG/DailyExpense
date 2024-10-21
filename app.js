import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/user.js';
import expenseRoutes from './routes/expense.js';
import { authenticate } from './middleware/Auth.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

// Use authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', authenticate, expenseRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
