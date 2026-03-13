import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

app.use(cors());
app.use(express.json());

// Mock database for transactions
let currentTransactionStatus = 'pending'; // simple mock for demo

// Helper to read config
const getConfig = () => {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  }
  return null;
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Config API
app.get('/api/config', (req, res) => {
  const config = getConfig();
  if (config) {
    res.json(config);
  } else {
    res.status(404).json({ error: 'Config not found' });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Payment API
app.get('/api/payment/status', (req, res) => {
  res.json({ status: currentTransactionStatus });
});

// Admin command to simulate payment outcome
app.post('/api/admin/simulate-payment', (req, res) => {
  const { status } = req.body; // 'success' or 'failure'
  currentTransactionStatus = status;
  res.json({ success: true, newStatus: status });
  
  // Reset after 10 seconds for demo purposes
  setTimeout(() => {
    currentTransactionStatus = 'pending';
  }, 10000);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
