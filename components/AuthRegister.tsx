
import React, { useState } from 'react';
import { signUp } from '../services/authService';
import { registerMember } from '../services/databaseService';
import { Loader2, UserPlus, Lock, Mail, User, X } from 'lucide-react';

interface Props {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
  onCancel?: () => void;
}

export const AuthRegister: React.FC<Props> = ({ onRegisterSuccess, onGoToLogin, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const authResponse = await signUp(email, password, name);
      if (authResponse.user) {
         await registerMember(authResponse.user);
      }
      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
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
          <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 -rotate-3">
             <UserPlus size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Registo</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Comece a gerar CVs agora</p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="animate-spin" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Conta Criada!</h3>
            <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-widest">Aguarde um momento...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
             <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-2xl border border-red-100 font-bold">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-3 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Criar Conta Gratuita"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs font-bold">Já tem uma conta?</p>
            <button onClick={onGoToLogin} className="text-slate-900 font-black uppercase tracking-widest hover:underline text-xs mt-1">
              Fazer Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
