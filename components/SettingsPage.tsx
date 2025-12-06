
import React, { useState } from 'react';
import { AppSettings, Category, Transaction } from '../types';
import { Moon, Sun, Bell, DollarSign, Plus, Trash2, Tag, Monitor, Check, Download, Database, FileSpreadsheet } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onRemoveCategory: (id: string) => void;
  transactions: Transaction[];
}

const SettingsPage: React.FC<Props> = ({ 
  settings, 
  onUpdateSettings, 
  categories, 
  onAddCategory, 
  onRemoveCategory,
  transactions
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    
    onAddCategory({
      id: Date.now().toString(),
      name: newCatName,
      color: newCatColor
    });
    
    setNewCatName('');
    setNewCatColor('#6366f1');
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Conta'];
    
    // Map rows
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.description}"`, // Quote description to handle commas
      t.category,
      t.type,
      t.amount.toFixed(2),
      t.accountType
    ]);

    // Combine
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Blob and Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumina_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-slate-400">Personalize sua experiência no Lúmina AI.</p>
      </div>

      {/* App Preferences */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Preferências do App
        </h3>

        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <p className="font-medium text-white">Tema</p>
                <p className="text-xs text-slate-400">Alterne entre modo claro e escuro</p>
              </div>
            </div>
            <div className="bg-slate-900 p-1 rounded-lg flex border border-slate-700">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  settings.theme === 'light' ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                Claro
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  settings.theme === 'dark' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                )}
              >
                Escuro
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-700/50"></div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Bell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Notificações</p>
                <p className="text-xs text-slate-400">Alertas de contas e dicas</p>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, notifications: !settings.notifications })}
              className={clsx(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.notifications ? "bg-emerald-500" : "bg-slate-700"
              )}
            >
              <div className={clsx(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                settings.notifications ? "left-7" : "left-1"
              )} />
            </button>
          </div>

           <div className="w-full h-px bg-slate-700/50"></div>

          {/* Currency */}
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">Moeda Principal</p>
                <p className="text-xs text-slate-400">Moeda utilizada nos relatórios</p>
              </div>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Categorias Personalizadas
        </h3>

        {/* Add New */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Nome da Categoria</label>
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Ex: Assinaturas"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
             <label className="text-xs font-medium text-slate-400 mb-1.5 block">Cor</label>
             <div className="flex gap-2">
                {colors.slice(0, 5).map(c => (
                  <button
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className={clsx(
                      "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                      newCatColor === c ? "border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="px-4 py-2 bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 h-[38px]"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl group hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-200 text-sm">{cat.name}</span>
              </div>
              <button 
                onClick={() => onRemoveCategory(cat.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Remover Categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Gerenciamento de Dados
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
           <div>
             <h4 className="font-bold text-white text-sm mb-1">Exportar Transações</h4>
             <p className="text-xs text-slate-400">Baixe todo o seu histórico financeiro em formato CSV.</p>
           </div>
           <button 
             onClick={handleExportCSV}
             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
           >
             <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
             Baixar CSV
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
