import express, { Application, Request, Response } from 'express';

import { connectDB } from './config/db';
import routerApiVer1 from './api/v1/routes/index.route';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize Express
const app: Application = express();
const port = process.env.PORT;

// Connect to MongoDB
connectDB();

// Routes
routerApiVer1(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
