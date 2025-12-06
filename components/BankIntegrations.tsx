import React, { useState, useRef, useEffect } from 'react';
import { 
  Landmark, Upload, FileSpreadsheet, FileText, CheckCircle, 
  AlertCircle, Loader2, Link as LinkIcon, Plus, X, ShieldCheck, Sparkles 
} from 'lucide-react';
import clsx from 'clsx';
import { Transaction } from '../types';

interface Props {
  onImportTransactions: (newTransactions: any[]) => void;
}

const BANKS = [
  { id: 'nubank', name: 'Nubank', color: '#820ad1' },
  { id: 'itau', name: 'Itaú', color: '#ec7000' },
  { id: 'bradesco', name: 'Bradesco', color: '#cc092f' },
  { id: 'santander', name: 'Santander', color: '#ec0000' },
  { id: 'inter', name: 'Inter', color: '#ff7a00' },
  { id: 'bb', name: 'Banco do Brasil', color: '#fbfd01', textColor: 'text-black' },
];

const BankIntegrations: React.FC<Props> = ({ onImportTransactions }) => {
  const [connectedBanks, setConnectedBanks] = useState<string[]>(() => {
    const saved = localStorage.getItem('finanai_connected_banks');
    return saved ? JSON.parse(saved) : [];
  });

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('finanai_connected_banks', JSON.stringify(connectedBanks));
  }, [connectedBanks]);

  const handleConnectBank = (bankId: string) => {
    if (connectedBanks.includes(bankId)) return;
    
    setIsConnecting(bankId);
    // Simula tempo de conexão API Open Finance
    setTimeout(() => {
      setConnectedBanks(prev => [...prev, bankId]);
      setIsConnecting(null);
      // Simula importação de dados do banco
      onImportTransactions([]); 
    }, 2000);
  };

  const handleDisconnectBank = (bankId: string) => {
    setConnectedBanks(prev => prev.filter(id => id !== bankId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simula progresso de upload e processamento AI
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      onImportTransactions([]); // Trigger mock import
      setTimeout(() => setUploadSuccess(false), 4000);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Conexões & Importação</h2>
          <p className="text-slate-400">Conecte seus bancos ou importe arquivos para que a IA analise suas finanças.</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Bank Connections Section */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Landmark className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Open Finance</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Conexão Segura e Criptografada
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BANKS.map((bank) => {
              const isConnected = connectedBanks.includes(bank.id);
              const isLoading = isConnecting === bank.id;

              return (
                <div 
                  key={bank.id}
                  className={clsx(
                    "relative p-4 rounded-xl border transition-all duration-300",
                    isConnected 
                      ? "bg-slate-800/80 border-emerald-500/50" 
                      : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                      style={{ backgroundColor: bank.color, color: bank.textColor || 'white' }}
                    >
                      {bank.name[0]}
                    </div>
                    {isConnected ? (
                      <button 
                        onClick={() => handleDisconnectBank(bank.id)}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Desconectar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleConnectBank(bank.id)}
                        disabled={isLoading}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{bank.name}</span>
                    {isConnected && (
                      <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        <LinkIcon className="w-3 h-3" /> Conectado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* File Import Section */}
        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Importar Arquivo</h3>
              <p className="text-xs text-slate-400">Suporta .CSV, .XLSX e .OFX</p>
            </div>
          </div>

          <div 
            className={clsx(
              "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all relative overflow-hidden group",
              isUploading ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30",
              uploadSuccess && "border-emerald-500 bg-emerald-500/5"
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".csv,.xlsx,.xls,.ofx"
            />

            {isUploading ? (
              <div className="w-full max-w-xs text-center">
                <div className="flex justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
                <h4 className="text-white font-bold mb-2">Processando com IA...</h4>
                <p className="text-slate-400 text-sm mb-4">Categorizando transações automaticamente</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="text-center animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-white font-bold mb-1">Importação Concluída!</h4>
                <p className="text-slate-400 text-sm">Suas transações foram adicionadas com sucesso.</p>
              </div>
            ) : (
              <div className="text-center cursor-pointer">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
                </div>
                <h4 className="text-white font-bold mb-1">Clique ou Arraste</h4>
                <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
                  Selecione seu extrato bancário (CSV ou Excel) para análise automática.
                </p>
                
                <div className="flex gap-2 justify-center mt-6">
                   <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">CSV</span>
                   <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">Excel</span>
                   <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">OFX</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Benefits Info */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 flex items-start gap-4">
         <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
           <Sparkles className="w-6 h-6 text-indigo-300" />
         </div>
         <div>
           <h4 className="text-lg font-bold text-white mb-2">Inteligência Artificial Ativa</h4>
           <p className="text-slate-300 text-sm leading-relaxed mb-4">
             Ao conectar suas contas ou importar arquivos, nosso sistema de IA (Gemini) irá:
           </p>
           <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-400">
             <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Categorizar gastos automaticamente</li>
             <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Detectar padrões de consumo</li>
             <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Identificar assinaturas recorrentes</li>
             <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Sugerir oportunidades de economia</li>
           </ul>
         </div>
      </div>
    </div>
  );
};

export default BankIntegrations;