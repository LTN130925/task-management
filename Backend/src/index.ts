import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// Load environment variables
dotenv.config();

// Database
import { connectDB } from './config/db';

// ===> Connect to MongoDB
connectDB();

// Routes
import routerApiVer1 from './api/v1/routes/index.route';


// Initialize Express
const app: Application = express();
const port = process.env.PORT;

// cookie parser
app.use(cookieParser());

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
