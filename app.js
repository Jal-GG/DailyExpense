import express from "express" 
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.js"
import expenseRoutes from "./routes/expense.js"
import dotenv from "dotenv";


const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.MONGO_URL
dotenv.config();

// Middleware
app.use(bodyParser.json());

// MongoDB connection
console.log(URL)
mongoose.connect("mongodb+srv://jalvrund2017:5TyeQQ1UecBdmjM9@cluster0.fc2rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Routes
app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
