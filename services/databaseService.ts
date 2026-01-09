
import { supabase } from './supabaseClient';
import { CVData } from '../types';

/**
 * Verifica se o usuário possui permissão de download.
 * Agora considera tanto o status do gateway quanto a aprovação manual.
 */
export const checkPaymentStatus = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status, admin_approved')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return false;
    if (!data) return false;

    return data.status === 'paid' || data.admin_approved === true;
  } catch (e) {
    return false;
  }
};

/**
 * Alterna (Toggle) a aprovação manual do administrador.
 * Não toca na coluna 'status' para evitar erros de constraint.
 */
export const toggleAdminApproval = async (userId: string, currentStatus: boolean) => {
  if (!supabase || !userId) throw new Error("ID de usuário ausente.");

  const { data, error } = await supabase
    .from('payments')
    .upsert({ 
      user_id: userId, 
      admin_approved: !currentStatus,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Reseta o status de pagamento (útil para testes ou cobrança recorrente).
 */
export const resetPaymentStatus = async (userId: string) => {
  if (!supabase || !userId) return null;
  const { error } = await supabase
    .from('payments')
    .update({ status: 'pending', admin_approved: false, amount: 0 })
    .eq('user_id', userId);
  
  if (error) throw error;
  return true;
};

// --- User/Member Management ---

/**
 * Regista um novo membro na base de dados após o registo de conta.
 */
export const registerMember = async (user: any) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('members')
        .upsert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizador',
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const getAllMembersWithPayments = async () => {
    if (!supabase) return [];
    try {
        const { data: members, error: mError } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (mError) throw mError;

        const { data: payments } = await supabase
            .from('payments')
            .select('user_id, status, admin_approved');

        return members.map(m => {
            const payment = payments?.find(p => p.user_id === m.user_id);
            return {
                ...m,
                payment_status: payment?.status || 'pending',
                admin_approved: payment?.admin_approved || false
            };
        });
    } catch (e) {
        console.error("Erro ao listar membros:", e);
        return [];
    }
};

/**
 * Deleção em cascata coordenada via Client
 */
export const deleteMemberComplete = async (userId: string, memberId: number) => {
    if (!supabase) return null;

    // 1. Deletar Documentos
    await supabase.from('documents').delete().eq('user_id', userId);
    
    // 2. Deletar CVs
    await supabase.from('user_cvs').delete().eq('user_id', userId);
    
    // 3. Deletar Pagamentos
    await supabase.from('payments').delete().eq('user_id', userId);
    
    // 4. Deletar Membro
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    
    if (error) throw error;
    return true;
};

export const getAdminStats = async (range: string = 'all') => {
    if (!supabase) return { users: 0, cvs: 0, revenue: 0, recentMembers: [], chartData: [] };
    try {
        const { count: usersCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
        const { count: cvsCount } = await supabase.from('user_cvs').select('*', { count: 'exact', head: true });
        const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'paid');
        const totalRevenue = payments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
        
        const { data: recentMembers } = await supabase.from('members')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        return { 
            users: usersCount || 0, 
            cvs: cvsCount || 0, 
            revenue: totalRevenue, 
            recentMembers: recentMembers || [], 
            chartData: [] 
        };
    } catch (e: any) {
        return { users: 0, cvs: 0, revenue: 0, recentMembers: [], chartData: [] };
    }
};

export const saveCV = async (cv: CVData, userId: string) => {
    if (!supabase) return null;
    const payload = { user_id: userId, personal: cv.personal, pt: cv.pt, en: cv.en, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('user_cvs').upsert([payload], { onConflict: 'user_id' }).select().single();
    return error ? null : data;
};

export const getUserCV = async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('user_cvs').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).single();
    return error ? null : (data as CVData);
};
