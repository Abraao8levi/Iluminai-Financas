import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  transactions: Transaction[];
}

const FinancialCharts: React.FC<Props> = ({ transactions }) => {
  // Helper for formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Process data for Weekly Activity (Income vs Expense)
  const processWeeklyData = () => {
    // Ideally this would group by actual dates, simplified for mock
    const data = [
      { name: 'Seg', income: 0, expense: 450 },
      { name: 'Ter', income: 0, expense: 200 },
      { name: 'Qua', income: 1200, expense: 180 },
      { name: 'Qui', income: 0, expense: 150 },
      { name: 'Sex', income: 0, expense: 800 },
      { name: 'Sab', income: 0, expense: 320 },
      { name: 'Dom', income: 0, expense: 100 },
    ];
    return data;
  };

  // Process data for Category Breakdown
  const processCategoryData = () => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const categoryMap: Record<string, number> = {};
    let totalExpense = 0;
    
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      totalExpense += t.amount;
    });

    return {
      data: Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value), // Sort by highest value
      total: totalExpense
    };
  };

  const weeklyData = processWeeklyData();
  const { data: categoryData, total: totalExpenses } = processCategoryData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Activity Chart */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Fluxo de Caixa Semanal</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="income" name="Entrada" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Saída" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Chart & List */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Despesas por Categoria</h3>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Pie Chart */}
          <div className="h-[250px] w-full md:w-1/2 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-lg font-bold text-white">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          {/* Detailed List */}
          <div className="w-full md:w-1/2 flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {categoryData.map((cat) => {
              const percentage = ((cat.value / totalExpenses) * 100).toFixed(1);
              const color = CATEGORY_COLORS[cat.name] || '#94a3b8';
              
              return (
                <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: color }} 
                    />
                    <span className="text-sm text-slate-300 font-medium truncate max-w-[100px]">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(cat.value)}</div>
                    <div className="text-xs text-slate-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;