import clsx from 'clsx';
import { ArrowLeft, Calendar, Eye, EyeOff, FileText, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

// Componente extraído para fora para evitar re-renderizações desnecessárias e perda de foco
interface InputFieldProps {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  colSpan?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  icon: Icon, 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  placeholder, 
  colSpan = "col-span-2", 
  isPassword = false,
  showPassword = false,
  onTogglePassword
}) => (
  <div className={colSpan}>
    <label className="text-sm font-medium text-slate-300 block mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600",
          isPassword ? "pr-12" : "pr-4"
        )}
        placeholder={placeholder}
        required
      />
      {isPassword && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

const SignUpPage: React.FC<Props> = ({ onSignUp, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    dob: '',
    phone: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação básica
    if (!formData.name || !formData.email || !formData.password) {
      alert("Por favor, preencha nome, email e senha.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao registrar.');
      }
      onSignUp(); // Chama a função para mudar o estado da aplicação
    } catch (error: any) {
      alert(`Erro no cadastro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative z-10 animate-fadeIn">
        <button 
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Crie sua conta</h2>
          <p className="text-slate-400">Preencha seus dados para começar</p>
        </div>

        <form onSubmit={handleSignUp} className="grid grid-cols-2 gap-4">
          <InputField 
            icon={User} 
            label="Nome Completo" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: João Silva" 
          />
          
          <InputField 
            icon={FileText} 
            label="CPF" 
            name="cpf" 
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00" 
            colSpan="col-span-2 md:col-span-1"
          />
          
          <InputField 
            icon={Calendar} 
            label="Data de Nascimento" 
            name="dob" 
            value={formData.dob}
            onChange={handleChange}
            type="date"
            colSpan="col-span-2 md:col-span-1"
          />

          <InputField 
            icon={Phone} 
            label="Telefone" 
            name="phone" 
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000" 
          />

          <InputField 
            icon={Mail} 
            label="E-mail" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="seu@email.com" 
          />

          <InputField 
            icon={Lock} 
            label="Crie uma senha" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            isPassword={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="Mínimo 8 caracteres" 
          />

          <div className="col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
            >
               {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Finalizar Cadastro"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="text-emerald-400 hover:underline">Termos de Uso</a> e{' '}
            <a href="#" className="text-emerald-400 hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;