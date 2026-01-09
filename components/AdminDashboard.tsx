
import React, { useEffect, useState } from 'react';
import { signOut } from '../services/authService';
import { 
    getAdminStats, 
    getAllMembersWithPayments, 
    deleteMemberComplete, 
    toggleAdminApproval 
} from '../services/databaseService';
import { 
    LayoutDashboard, Users, FileText, TrendingUp, LogOut, 
    DollarSign, Calendar, Loader2, Search, Trash2, 
    Unlock, CheckCircle, AlertCircle 
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

interface AdminData {
    users: number;
    cvs: number;
    revenue: number;
    recentMembers: any[];
}

type Tab = 'dashboard' | 'users';

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  const [statsData, setStatsData] = useState<AdminData>({ 
    users: 0, 
    cvs: 0, 
    revenue: 0, 
    recentMembers: []
  });
  
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  useEffect(() => {
    let result = members;
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(m => 
            (m.name && m.name.toLowerCase().includes(lowerTerm)) || 
            (m.email && m.email.toLowerCase().includes(lowerTerm))
        );
    }
    setFilteredMembers(result);
  }, [searchTerm, members]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
        const stats = await getAdminStats(timeRange);
        setStatsData(stats as AdminData);
    } catch (e) {
        console.error("Erro ao carregar dashboard", e);
    } finally {
        setLoading(false);
    }
  };

  const loadMembers = async () => {
      setLoadingMembers(true);
      try {
          const all = await getAllMembersWithPayments();
          setMembers(all);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingMembers(false);
      }
  };

  const handleTabChange = (tab: Tab) => {
      setActiveTab(tab);
      if (tab === 'users') loadMembers();
      else if (tab === 'dashboard') loadDashboardData();
  };

  const handleToggleApproval = async (userId: string, currentApproved: boolean, memberId: number) => {
      if (!userId) return;
      setProcessingId(userId);
      try {
          await toggleAdminApproval(userId, currentApproved);
          setMembers(prev => prev.map(m => m.id === memberId ? { ...m, admin_approved: !currentApproved } : m));
      } catch (e: any) {
          alert(`Erro ao atualizar: ${e.message}`);
      } finally {
          setProcessingId(null);
      }
  };

  const handleDeleteMember = async (userId: string, memberId: number) => {
      if (!window.confirm("⚠️ ATENÇÃO: Esta ação é definitiva. Deseja excluir este usuário e todos os seus arquivos (CVs e Documentos)?")) return;
      
      setProcessingId(userId);
      try {
          await deleteMemberComplete(userId, memberId);
          setMembers(prev => prev.filter(m => m.id !== memberId));
          alert("Usuário removido com sucesso!");
      } catch (e: any) {
          alert(`Erro ao excluir: ${e.message}`);
      } finally {
          setProcessingId(null);
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans relative">
      <aside className="w-full md:w-72 bg-slate-950 text-white flex flex-col shrink-0 z-20">
        <div className="p-8 border-b border-slate-900">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-xl">
               <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">CV Smart Admin</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Painel de Controlo</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button 
             onClick={() => handleTabChange('users')}
             className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <Users size={18} />
            Utilizadores
          </button>
        </nav>

        <div className="p-6 border-t border-slate-900">
          <button onClick={() => signOut().then(onLogout)} className="w-full flex items-center gap-3 px-5 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative z-10 bg-slate-100">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    {activeTab === 'dashboard' ? 'Relatórios' : 'Gestão de Membros'}
                </h2>
                
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                    <Calendar size={16} className="ml-3 text-slate-400" />
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-900 py-2 pr-8 outline-none cursor-pointer">
                        <option value="30d">Últimos 30 dias</option>
                        <option value="all">Todo o Período</option>
                    </select>
                </div>
            </div>

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Utilizadores', value: statsData.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'CVs Gerados', value: statsData.cvs, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Faturação (MT)', value: statsData.revenue.toLocaleString(), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl w-fit mb-6`}>
                                <stat.icon size={28} />
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{loading ? '...' : stat.value}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
                         <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-4 text-slate-400" size={18} />
                                <input 
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold text-sm" 
                                    placeholder="Procurar utilizador..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            <button onClick={loadMembers} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest cursor-pointer">
                                <Loader2 size={16} className={loadingMembers ? "animate-spin" : ""} />
                                Atualizar Lista
                            </button>
                         </div>

                         <div className="overflow-x-auto rounded-3xl border border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Utilizador</th>
                                        <th className="px-8 py-5">Pagamento</th>
                                        <th className="px-8 py-5 text-center">Ações de Acesso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingMembers ? (
                                        <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></td></tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr><td colSpan={3} className="py-10 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum utilizador encontrado</td></tr>
                                    ) : filteredMembers.map((member: any) => (
                                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{member.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{member.email}</div>
                                                <div className="text-[9px] text-slate-300 font-mono mt-1">{member.user_id}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        member.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        Gateway: {member.payment_status === 'paid' ? 'PAGO' : 'PENDENTE'}
                                                    </span>
                                                    {member.admin_approved && (
                                                        <span className="w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-200">
                                                            Aprovação Manual Ativa
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    {member.admin_approved ? (
                                                        <button 
                                                            disabled={processingId === member.user_id}
                                                            onClick={() => handleToggleApproval(member.user_id, true, member.id)} 
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md cursor-pointer disabled:opacity-50"
                                                        >
                                                            {processingId === member.user_id ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle size={14} />} 
                                                            DOWNLOAD LIBERADO
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            disabled={processingId === member.user_id}
                                                            onClick={() => handleToggleApproval(member.user_id, false, member.id)} 
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
                                                        >
                                                            {processingId === member.user_id ? <Loader2 className="animate-spin" size={14}/> : <Unlock size={14} />} 
                                                            LIBERAR DOWNLOAD
                                                        </button>
                                                    )}
                                                    
                                                    <button 
                                                        disabled={processingId === member.user_id}
                                                        onClick={() => handleDeleteMember(member.user_id, member.id)} 
                                                        className="p-3 text-slate-300 hover:text-red-600 transition-all cursor-pointer disabled:opacity-30"
                                                        title="Excluir Definitivamente"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                         
                         <div className="mt-8 bg-blue-50 p-6 rounded-3xl flex items-start gap-4 border border-blue-100">
                            <AlertCircle className="text-blue-600 shrink-0" size={24} />
                            <div>
                                <h4 className="font-black text-xs text-blue-900 uppercase tracking-widest mb-1">Dica de Gestão</h4>
                                <p className="text-[11px] text-blue-700 leading-relaxed font-bold">
                                    A liberação manual (botão azul/verde) substitui a necessidade de aguardar o webhook do gateway. 
                                    Ao liberar manualmente, o sistema habilita imediatamente os botões de download para o usuário final.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
