require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lumina_secret_key_change_me';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for avatar uploads

// Passport e Session Middleware
app.use(session({ secret: 'lumina_session_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



// Root route to confirm backend is running
app.get('/', (req, res) => {
  res.json({
    message: 'Lúmina AI Backend is running!',
    status: 'OK',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      goals: '/api/goals',
      categories: '/api/categories',
      user: '/api/user'
    }
  });
});

// --- Database Connection (SQLite with Sequelize) ---
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './lumina.sqlite', // File-based database
  logging: false // Disable logging SQL queries to console
});

// --- Models Definition ---
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.TEXT } // TEXT can hold base64 strings
});

const Transaction = sequelize.define('Transaction', {
  date: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // 'income' or 'expense'
  accountType: { type: DataTypes.STRING }
});

const Goal = sequelize.define('Goal', {
  name: { type: DataTypes.STRING, allowNull: false },
  targetAmount: { type: DataTypes.FLOAT, allowNull: false },
  currentAmount: { type: DataTypes.FLOAT, allowNull: false },
  color: { type: DataTypes.STRING }
});

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING, allowNull: false }
});

// --- Associations ---
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

// --- Sync Database ---
const connectAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Connection has been established successfully.');
    await sequelize.sync({ alter: true }); // Creates/updates tables without losing data
    console.log('✅ Database synchronized.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};
connectAndSync();

// --- Auth Middleware ---
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    // Sequelize uses 'id' (integer), not '_id' (string)
    const verified = jwt.verify(token, JWT_SECRET); 
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// --- Routes ---

// 1. Auth Routes

// Google Auth
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=true` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    // Redireciona para o frontend com o token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  });

// Facebook Auth
app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/api/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL}/login?error=true` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  });

app.post('/api/auth/register', 
  // Middleware de validação
  body('email').isEmail().withMessage('Por favor, forneça um e-mail válido.'),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('name').notEmpty().withMessage('O nome é obrigatório.'),
  async (req, res) => {
  try {
    // Verifica se há erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // --- SEED INITIAL DATA FOR NEW USER ---
    const userId = user.id;

    // 1. Default Categories
    const defaultCategories = [
      { name: 'Moradia', color: '#ef4444', userId },
      { name: 'Alimentação', color: '#f97316', userId },
      { name: 'Transporte', color: '#f59e0b', userId },
      { name: 'Lazer', color: '#ec4899', userId },
      { name: 'Saúde', color: '#06b6d4', userId },
      { name: 'Educação', color: '#3b82f6', userId },
      { name: 'Salário', color: '#10b981', userId },
      { name: 'Investimentos', color: '#6366f1', userId },
      { name: 'Outros', color: '#64748b', userId },
    ];
    await Category.bulkCreate(defaultCategories);

    // 2. Mock Transactions for the last 30 days
    const today = new Date();
    const mockTransactions = [
      // Income
      { date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], description: 'Salário Mensal', amount: 5500, category: 'Salário', type: 'income', accountType: 'CHECKING', userId },
      // Expenses
      { date: new Date(today.getFullYear(), today.getMonth(), 2).toISOString().split('T')[0], description: 'Aluguel', amount: 1500, category: 'Moradia', type: 'expense', accountType: 'CHECKING', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().split('T')[0], description: 'Supermercado', amount: 450, category: 'Alimentação', type: 'expense', accountType: 'CREDIT_CARD', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0], description: 'Conta de Luz', amount: 180, category: 'Moradia', type: 'expense', accountType: 'CHECKING', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 7).toISOString().split('T')[0], description: 'Uber', amount: 45.50, category: 'Transporte', type: 'expense', accountType: 'CREDIT_CARD', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0], description: 'Cinema', amount: 60, category: 'Lazer', type: 'expense', accountType: 'CREDIT_CARD', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0], description: 'Farmácia', amount: 95, category: 'Saúde', type: 'expense', accountType: 'DEBIT', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0], description: 'iFood', amount: 75.80, category: 'Alimentação', type: 'expense', accountType: 'CREDIT_CARD', userId },
      { date: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().split('T')[0], description: 'Curso Online', amount: 250, category: 'Educação', type: 'expense', accountType: 'CREDIT_CARD', userId },
    ];
    await Transaction.bulkCreate(mockTransactions);

    // 3. Mock Goals
    const mockGoals = [
      { 
        name: 'Reserva de Emergência', 
        targetAmount: 10000, 
        currentAmount: 2500, 
        color: '#10b981',
        userId
      },
      { 
        name: 'Viagem para a Praia', 
        targetAmount: 4000, 
        currentAmount: 800, 
        color: '#3b82f6',
        userId
      }
    ];
    await Goal.bulkCreate(mockGoals);

    // Create token
    const token = jwt.sign({ id: userId }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email or password incorrect' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Email or password incorrect' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. User Data Routes
app.get('/api/user/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/user/update', authenticate, async (req, res) => {
  try {
    const updates = req.body; // Can include name, avatar, settings
    await User.update(updates, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Transactions Routes
app.get('/api/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ where: { userId: req.user.id }, order: [['date', 'DESC']] });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/transactions', authenticate, 
  // Adicionar validação
  body('description').notEmpty().withMessage('A descrição é obrigatória.'),
  body('amount').isFloat({ gt: 0 }).withMessage('O valor deve ser um número positivo.'),
  body('category').notEmpty().withMessage('A categoria é obrigatória.'),
  body('type').isIn(['income', 'expense']).withMessage('O tipo deve ser "income" ou "expense".'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const transaction = await Transaction.create({ ...req.body, userId: req.user.id });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/transactions/:id', authenticate, 
  // Adicionar validação semelhante para atualização
  body('description').optional().notEmpty().withMessage('A descrição é obrigatória.'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('O valor deve ser um número positivo.'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    await Transaction.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    const transaction = await Transaction.findByPk(req.params.id);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/transactions/:id', authenticate, async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Goals Routes
app.get('/api/goals', authenticate, async (req, res) => {
  try {
    const goals = await Goal.findAll({ where: { userId: req.user.id } });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/goals', authenticate, async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user.id });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/goals/:id', authenticate, async (req, res) => {
  try {
    await Goal.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    const goal = await Goal.findByPk(req.params.id);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/goals/:id', authenticate, async (req, res) => {
  try {
    await Goal.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Categories Routes
app.get('/api/categories', authenticate, async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { userId: req.user.id } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/categories', authenticate, async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, userId: req.user.id });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.put('/api/categories/:id', authenticate, async (req, res) => {
  try {
    await Category.update(req.body, {
      where: { id: req.params.id, userId: req.user.id }
    });
    const category = await Category.findByPk(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. AI Multi-Provider Routes
const AIFactory = require('./ai/aiFactory');

app.get('/api/ai/status', (req, res) => {
  res.json(AIFactory.getProviderInfo());
});

app.post('/api/ai/advice', authenticate, async (req, res) => {
  try {
    const { userQuery, transactions } = req.body;
    const provider = AIFactory.getProvider();
    const advice = await provider.generateAdvice(transactions || [], userQuery || '');
    res.json({ advice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/ai/insight', authenticate, async (req, res) => {
  try {
    const { transactions } = req.body;
    const provider = AIFactory.getProvider();
    const insight = await provider.generateInsight(transactions || []);
    res.json({ insight });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/ai/parse-receipt', authenticate, async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ message: 'Arquivo em base64 é obrigatório.' });
    }
    const provider = AIFactory.getProvider();
    const parsedData = await provider.parseReceipt(fileBase64, mimeType || 'image/jpeg');
    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
