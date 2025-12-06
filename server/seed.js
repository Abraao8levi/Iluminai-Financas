require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Database Connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './lumina.sqlite',
  logging: false
});

// Models Definition (same as in index.js)
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.TEXT }
});

const Transaction = sequelize.define('Transaction', {
  date: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
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

// Associations
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQLite database.');

    await sequelize.sync({ force: true }); // Reset database
    console.log('✅ Database synchronized and reset.');

    // Create sample user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: hashedPassword,
      avatar: ''
    });

    const userId = user.id;
    console.log(`✅ Sample user created: ${user.name} (${user.email})`);

    // Seed Categories
    const categories = [
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
    await Category.bulkCreate(categories);
    console.log(`✅ ${categories.length} categories seeded.`);

    // Seed Transactions (more comprehensive data)
    const today = new Date();
    const transactions = [];

    // Generate transactions for the last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);

      // Monthly salary
      transactions.push({
        date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0],
        description: 'Salário Mensal',
        amount: 5500,
        category: 'Salário',
        type: 'income',
        accountType: 'CHECKING',
        userId
      });

      // Random expenses
      const expenses = [
        { desc: 'Aluguel', amt: 1500, cat: 'Moradia', acc: 'CHECKING' },
        { desc: 'Supermercado', amt: Math.random() * 500 + 200, cat: 'Alimentação', acc: 'CREDIT_CARD' },
        { desc: 'Conta de Luz', amt: Math.random() * 100 + 100, cat: 'Moradia', acc: 'CHECKING' },
        { desc: 'Uber/Táxi', amt: Math.random() * 100 + 20, cat: 'Transporte', acc: 'CREDIT_CARD' },
        { desc: 'Cinema/Teatro', amt: Math.random() * 50 + 30, cat: 'Lazer', acc: 'CREDIT_CARD' },
        { desc: 'Farmácia', amt: Math.random() * 100 + 50, cat: 'Saúde', acc: 'DEBIT' },
        { desc: 'Restaurante', amt: Math.random() * 150 + 50, cat: 'Alimentação', acc: 'CREDIT_CARD' },
        { desc: 'Curso Online', amt: Math.random() * 300 + 100, cat: 'Educação', acc: 'CREDIT_CARD' },
        { desc: 'Combustível', amt: Math.random() * 200 + 100, cat: 'Transporte', acc: 'DEBIT' },
        { desc: 'Academia', amt: Math.random() * 100 + 50, cat: 'Saúde', acc: 'CREDIT_CARD' },
        { desc: 'Streaming', amt: Math.random() * 50 + 20, cat: 'Lazer', acc: 'CREDIT_CARD' },
        { desc: 'Manutenção Casa', amt: Math.random() * 300 + 100, cat: 'Moradia', acc: 'CHECKING' },
        { desc: 'Roupas', amt: Math.random() * 200 + 50, cat: 'Outros', acc: 'CREDIT_CARD' },
        { desc: 'Presentes', amt: Math.random() * 150 + 30, cat: 'Outros', acc: 'CREDIT_CARD' },
        { desc: 'Investimento', amt: Math.random() * 1000 + 500, cat: 'Investimentos', acc: 'CHECKING' },
      ];

      expenses.forEach(exp => {
        const day = Math.floor(Math.random() * 28) + 1;
        transactions.push({
          date: new Date(month.getFullYear(), month.getMonth(), day).toISOString().split('T')[0],
          description: exp.desc,
          amount: Math.round(exp.amt * 100) / 100,
          category: exp.cat,
          type: 'expense',
          accountType: exp.acc,
          userId
        });
      });
    }

    await Transaction.bulkCreate(transactions);
    console.log(`✅ ${transactions.length} transactions seeded.`);

    // Seed Goals
    const goals = [
      {
        name: 'Reserva de Emergência',
        targetAmount: 15000,
        currentAmount: 3500,
        color: '#10b981',
        userId
      },
      {
        name: 'Viagem para a Praia',
        targetAmount: 4000,
        currentAmount: 1200,
        color: '#3b82f6',
        userId
      },
      {
        name: 'Novo Carro',
        targetAmount: 50000,
        currentAmount: 8000,
        color: '#f59e0b',
        userId
      },
      {
        name: 'Casa Própria',
        targetAmount: 200000,
        currentAmount: 25000,
        color: '#ef4444',
        userId
      }
    ];
    await Goal.bulkCreate(goals);
    console.log(`✅ ${goals.length} goals seeded.`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`Sample user credentials: ${user.email} / password123`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
