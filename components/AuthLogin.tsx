
import React, { useState } from 'react';
import { signIn } from '../services/authService';
import { Loader2, LogIn, Lock, Mail, Smartphone, AlertCircle, X } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
  onCancel?: () => void;
}

export const AuthLogin: React.FC<Props> = ({ onLoginSuccess, onGoToRegister, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (err: any) {
      if (err.message && (err.message.includes("Email not confirmed") || err.message.includes("not confirmed"))) {
          setError("Este email ainda não foi confirmado. Verifique a sua caixa de entrada.");
      } else {
          setError(err.message || "Falha ao entrar. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      {onCancel && (
        <button 
          onClick={onCancel} 
          className="absolute top-6 right-6 p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
        >
          <X size={24} />
        </button>
      )}

      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 rotate-3">
             <LogIn size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Entrar</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Aceda à sua conta profissional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Segura</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-2xl border border-red-100 flex items-start gap-3 font-bold">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Fazer Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs font-bold">Ainda não tem conta?</p>
          <button onClick={onGoToRegister} className="text-blue-600 font-black uppercase tracking-tighter hover:underline text-sm mt-1">
            Criar Conta Gratuita
          </button>
        </div>
      </div>
    </div>
  );
};
