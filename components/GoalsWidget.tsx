
import React, { useState } from 'react';
import { Target, Plus, Pencil, Trash2, X, Check, TrendingUp, Calendar } from 'lucide-react';
import { Goal } from '../types';
import clsx from 'clsx';

interface Props {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalsWidget: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'NEW' or goal ID
  const [formData, setFormData] = useState<Partial<Goal>>({});

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const startEdit = (goal?: Goal) => {
    if (goal) {
      setIsEditing(goal.id);
      setFormData({ ...goal });
    } else {
      setIsEditing('NEW');
      setFormData({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        color: '#6366f1', // Default Indigo
        deadline: ''
      });
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.targetAmount) return;

    if (isEditing === 'NEW') {
      onAddGoal({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        color: formData.color || '#6366f1',
        deadline: formData.deadline
      });
    } else {
      onUpdateGoal({
        id: isEditing!,
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        color: formData.color || '#6366f1',
        deadline: formData.deadline
      } as Goal);
    }
    setIsEditing(null);
  };

  const colors = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Minhas Metas
        </h3>
        <button 
          onClick={() => startEdit()}
          className="p-1.5 bg-slate-800 hover:bg-primary text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Nova Meta"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List Mode */}
      {!isEditing && (
        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">Nenhuma meta definida.</p>
              <button onClick={() => startEdit()} className="text-indigo-400 text-sm font-bold hover:underline mt-1">
                Criar primeira meta
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
              
              return (
                <div key={goal.id} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">{goal.name}</h4>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(goal)} className="text-slate-500 hover:text-primary"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => onDeleteGoal(goal.id)} className="text-slate-500 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <span className="text-sm font-bold ml-2" style={{ color: goal.color }}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                    <div 
                      className="h-full rounded-full transition-all duration-500 relative"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Alvo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit/Create Form Mode */}
      {isEditing && (
        <div className="animate-fadeIn space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome da Meta</label>
            <input 
              type="text" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
              placeholder="Ex: Viagem"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs text-slate-400 block mb-1">Alvo (R$)</label>
                <input 
                  type="number" 
                  value={formData.targetAmount || ''} 
                  onChange={e => setFormData({...formData, targetAmount: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                />
             </div>
             <div>
                <label className="text-xs text-slate-400 block mb-1">Atual (R$)</label>
                <input 
                  type="number" 
                  value={formData.currentAmount || ''} 
                  onChange={e => setFormData({...formData, currentAmount: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                />
             </div>
          </div>

          <div>
             <label className="text-xs text-slate-400 block mb-1">Prazo (Opcional)</label>
             <div className="relative">
               <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
               <input 
                 type="date" 
                 value={formData.deadline || ''} 
                 onChange={e => setFormData({...formData, deadline: e.target.value})}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-primary outline-none [color-scheme:dark]"
               />
             </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Cor</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({...formData, color: c})}
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 transition-transform",
                    formData.color === c ? "border-white scale-110" : "border-transparent hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => setIsEditing(null)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-xs font-bold"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
      
      {!isEditing && (
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <TrendingUp className="w-3 h-3 text-emerald-400" />
             <span>Mantenha o foco nos seus objetivos!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsWidget;
