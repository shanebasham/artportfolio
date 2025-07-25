import express from 'express';
import sendEmailRoute from './send-email.js';
import authRoute from './auth.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api', sendEmailRoute);
app.use('/api', authRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
