const mongoose = require('mongoose');

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  settings: {
    currency: { type: String, default: 'BRL' },
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true }
  }
});

// --- Transaction Schema ---
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  accountType: { type: String, required: true }, // 'CHECKING', 'SAVINGS', etc.
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

// --- Goal Schema ---
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  color: { type: String, default: '#6366f1' },
  deadline: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// --- Category Schema (Custom Categories) ---
const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#94a3b8' }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Goal: mongoose.model('Goal', goalSchema),
  Category: mongoose.model('Category', categorySchema)
};