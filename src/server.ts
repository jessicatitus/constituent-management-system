import express from 'express';
import cors from 'cors';
import constituentsRouter from './routes/constituents';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';
import fs from 'fs';
import path from 'path';

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());

// Public routes
app.use('/auth', authRouter);

// Protected routes
app.use('/constituents', authMiddleware, constituentsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 