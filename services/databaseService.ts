
import { supabase } from './supabaseClient';
import { CVData } from '../types';

/**
 * Verifica se o usuário (logado ou convidado) possui um pagamento confirmado.
 */
export const checkPaymentStatus = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar pagamento:", error.message || error);
      return false;
    }
    return !!data;
  } catch (e) {
    return false;
  }
};

/**
 * Aprovação manual de pagamento pelo Administrador.
 * Tenta atualizar um registro existente ou criar um novo se não existir.
 */
export const manualApprovePayment = async (userId: string) => {
  if (!supabase || !userId) {
    throw new Error("Supabase não inicializado ou ID de usuário ausente.");
  }

  try {
    // 1. Tentar verificar se já existe um registro para este usuário
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // 2. Se existe, atualiza para 'paid'
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          amount: 97.00,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // 3. Se não existe, insere um novo registro
      const { data, error } = await supabase
        .from('payments')
        .insert([{ 
          user_id: userId, 
          status: 'paid',
          amount: 97.00,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } catch (e: any) {
    console.error("Erro fatal manualApprovePayment:", e.message || e);
    throw e;
  }
};

/**
 * Remove a permissão de download (reseta para pendente).
 */
export const resetPaymentStatus = async (userId: string) => {
  if (!supabase || !userId) return null;
  try {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'pending', amount: 0 })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erro ao resetar pagamento:", error.message || error);
      throw error;
    }
    return true;
  } catch (e: any) {
    console.error("Erro resetPaymentStatus:", e.message || e);
    throw e;
  }
};

// --- User/Member Management ---

export const registerMember = async (user: any) => {
  if (!supabase || !user) return;
  try {
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing) return existing;
      const { data, error } = await supabase
        .from('members')
        .insert([{
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            status: 'approved',
            created_at: new Date().toISOString()
        }])
        .select().single();
      if (error) throw error;
      return data;
  } catch (err: any) {
      return null;
  }
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
            .select('user_id, status');

        return members.map(m => ({
            ...m,
            payment_status: payments?.find(p => p.user_id === m.user_id)?.status || 'pending'
        }));
    } catch (e) {
        console.error("Erro ao listar membros:", e);
        return [];
    }
};

export const updateMemberStatus = async (memberId: number, newStatus: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('members').update({ status: newStatus }).eq('id', memberId).select().single();
    if (error) throw error;
    return data;
};

export const deleteMember = async (memberId: number) => {
    if (!supabase) return null;
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
        const { data: recentMembers } = await supabase.from('members').select('*').order('created_at', { ascending: false }).limit(5);
        return { users: usersCount || 0, cvs: cvsCount || 0, revenue: totalRevenue, recentMembers: recentMembers || [], chartData: [] };
    } catch (e: any) {
        return { users: 0, cvs: 0, revenue: 0, recentMembers: [], chartData: [] };
    }
};

export const saveCV = async (cv: CVData, userId: string) => {
    if (!supabase) return null;
    const payload = { user_id: userId, personal: cv.personal, pt: cv.pt, en: cv.en, updated_at: new Date().toISOString() };
    if (cv.id) {
        const { data, error } = await supabase.from('user_cvs').update(payload).eq('id', cv.id).select().single();
        return error ? null : data;
    } else {
        const { data, error } = await supabase.from('user_cvs').insert([payload]).select().single();
        return error ? { ...cv, id: crypto.randomUUID(), user_id: userId } : data;
    }
};

export const getUserCV = async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('user_cvs').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).single();
    return error ? null : (data as CVData);
};
