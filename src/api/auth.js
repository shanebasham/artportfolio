import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const users = {
  shanebasham: 'shane1',
};

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const validPassword = users[username];

  if (!validPassword || validPassword !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate a JWT token (valid for 1 hour)
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, username });
});

export default router;
