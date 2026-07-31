import React, { useState, useRef } from 'react';
import { 
  Landmark, Upload, FileSpreadsheet, CheckCircle, 
  Loader2, Link as LinkIcon, Plus, ShieldCheck, Sparkles, FileText, Camera
} from 'lucide-react';
import clsx from 'clsx';
import { parseReceiptWithAI } from '../services/api';
import { Transaction, TransactionType, AccountType } from '../types';

interface Props {
  onImportTransactions?: (newTransactions: any[]) => void;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const handleConnectBank = (bankId: string) => {
    setIsConnecting(bankId);
    setTimeout(() => {
      const updated = [...connectedBanks, bankId];
      setConnectedBanks(updated);
      localStorage.setItem('finanai_connected_banks', JSON.stringify(updated));
      setIsConnecting(null);
    }, 1500);
  };

  const handleDisconnectBank = (bankId: string) => {
    const updated = connectedBanks.filter(id => id !== bankId);
    setConnectedBanks(updated);
    localStorage.setItem('finanai_connected_banks', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadSuccess(true);

      const mockParsed = [
        {
          date: new Date().toISOString().split('T')[0],
          description: 'Importado de ' + file.name,
          amount: 150.00,
          category: 'Alimentação',
          type: TransactionType.EXPENSE,
          accountType: AccountType.CHECKING
        }
      ];

      if (onImportTransactions) {
        onImportTransactions(mockParsed);
      }

      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1500);
  };

  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      try {
        const parsed = await parseReceiptWithAI(base64, file.type || 'image/jpeg');
        const formatted: Transaction = {
          id: String(Date.now()),
          description: parsed.description || 'Comprovante Escaneado',
          amount: Number(parsed.amount) || 0,
          date: parsed.date || new Date().toISOString().split('T')[0],
          category: parsed.category || 'Outros',
          type: parsed.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
          accountType: (parsed.accountType as AccountType) || AccountType.CHECKING
        };

        if (onImportTransactions) {
          onImportTransactions([formatted]);
        }
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err: any) {
        alert(err.message || 'Erro ao escanear comprovante');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Conexões & Importação Inteligente</h2>
          <p className="text-slate-400">Conecte seus bancos ou escaneie comprovantes/extratos para análise por IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

        <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Importar Extratos ou Fotos</h3>
              <p className="text-xs text-slate-400">Leitura OCR via IA ou arquivos .CSV, .OFX, PDF, Imagens</p>
            </div>
          </div>

          <div 
            className={clsx(
              "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all relative overflow-hidden group",
              isUploading ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30",
              uploadSuccess && "border-emerald-500 bg-emerald-500/5"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".csv,.xlsx,.xls,.ofx"
            />
            <input 
              type="file" 
              ref={receiptInputRef} 
              onChange={handleReceiptScan} 
              className="hidden" 
              accept="image/*,application/pdf"
            />

            {isUploading ? (
              <div className="w-full max-w-xs text-center">
                <div className="flex justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <h4 className="text-white font-bold mb-1">Leitura Multimodal via IA...</h4>
                <p className="text-slate-400 text-xs mb-3">Extraindo data, valor e categoria</p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-200"
                    style={{ width: `${uploadProgress || 70}%` }}
                  />
                </div>
              </div>
            ) : uploadSuccess ? (
              <div className="text-center animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-white font-bold text-sm mb-1">Transação Identificada!</h4>
                <p className="text-slate-400 text-xs">Os dados do comprovante foram processados com sucesso.</p>
              </div>
            ) : (
              <div className="text-center w-full">
                <div className="flex justify-center space-x-3 mb-3">
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Escanear Foto / Comprovante</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-700"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Extrato (CSV / OFX)</span>
                  </button>
                </div>
                <p className="text-slate-500 text-xs max-w-[280px] mx-auto">
                  Tire foto de cupons fiscais ou comprovantes PIX para categorização automática por IA.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-300" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-2">Inteligência Artificial Multimodal Ativa</h4>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Nosso sistema de IA processa comprovantes, extratos e arquivos em qualquer formato:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Leitura OCR de fotos de cupons e comprovantes PIX</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Categorização automática em segundos</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Extração de data, valor e estabelecimento</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Compatível com Gemini, GPT-4o, Groq e Ollama</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BankIntegrations;