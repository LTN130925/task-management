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
import routerApiClientVer1 from './api/v1/client/routes/index.route';
import routerApiAdminVer1 from './api/v1/admin/routes/index.route';

// cron
import { cleanUpdatedByJobAccount } from './cron/cleanUpdatedBy';
import { cleanUpdatedByJobRole } from './cron/cleanUpdatedBy';

// Initialize Express
const app: Application = express();
const port = process.env.PORT;

// cookie parser
app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

// cors
app.use(cors());

// cron
cleanUpdatedByJobAccount();
cleanUpdatedByJobRole();

// Routes
// => v1
routerApiClientVer1(app);
routerApiAdminVer1(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
