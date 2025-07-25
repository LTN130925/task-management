import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Database
import { connectDB } from './config/db';

// Routes
import routerApiVer1 from './api/v1/routes/index.route';

// Load environment variables
dotenv.config();

// Initialize Express
const app: Application = express();
const port = process.env.PORT;

// Connect to MongoDB
connectDB();

// parse application/json
app.use(bodyParser.json());

// cors
app.use(cors());

// Routes
routerApiVer1(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
