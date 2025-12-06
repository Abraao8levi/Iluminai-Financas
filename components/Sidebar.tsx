import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Receipt, Bot, Settings, LogOut, Hexagon, Landmark, Zap } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, onLogout }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
    { id: ViewState.TRANSACTIONS, label: 'Transações', icon: Receipt },
    { id: ViewState.INTEGRATIONS, label: 'Bancos & Arquivos', icon: Landmark },
    { id: ViewState.AI_INSIGHTS, label: 'Lúmina AI', icon: Bot },
    { id: ViewState.ECONOMY_MODE, label: 'Modo Foco', icon: Zap },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-surface border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-full"></div>
             <div className="relative p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg border border-indigo-400/20">
               <Hexagon className="w-6 h-6 text-white fill-indigo-500/20" />
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight">
              Lúmina
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
              Finance AI
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
           <button 
             onClick={() => {
               onChangeView(ViewState.SETTINGS);
               setIsOpen(false);
             }}
             className={clsx(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2",
               currentView === ViewState.SETTINGS
                 ? "bg-primary text-white shadow-lg shadow-primary/25"
                 : "text-slate-400 hover:text-white hover:bg-slate-700/50"
             )}
           >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-danger/80 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;