import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: number;
  trend?: number;
  type: 'neutral' | 'positive' | 'negative';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, type, icon }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getTrendColor = () => {
    if (type === 'positive') return 'text-emerald-400 bg-emerald-400/10';
    if (type === 'negative') return 'text-rose-400 bg-rose-400/10';
    return 'text-slate-400 bg-slate-400/10';
  };

  return (
    <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-600 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
         {icon || <DollarSign className="w-16 h-16" />}
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-2">{formatCurrency(value)}</h3>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2">
            <span className={clsx("px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1", getTrendColor())}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-slate-500 text-xs">vs. mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;