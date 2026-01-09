
import { supabase } from './supabaseClient';

/**
 * Tenta fazer o upload de um documento. 
 * Silencia erros de chave estrangeira para permitir que usuários "convidados" (sem conta) 
 * continuem o fluxo de extração de IA mesmo sem persistência no banco.
 */
export const uploadUserDocument = async (file: File, userId: string, category: 'ID_FRONT' | 'ID_BACK' | 'CERTIFICATE' | 'OTHER') => {
  if (!supabase) return null;

  try {
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `user-${userId}/${Date.now()}-${safeFileName}`;

    // 1. Tentar Upload para o Storage (Buckets são mais flexíveis que tabelas com FK)
    const { error: uploadError, data: uploadData } = await supabase
      .storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.warn("⚠️ Supabase Storage Upload falhou:", uploadError.message);
      return null;
    }

    // 2. Tentar inserir metadados na tabela 'documents'
    // Se o userId for um UUID de convidado, a FK na tabela documents pode falhar se não houver trigger.
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([{
        user_id: userId,
        file_path: uploadData.path,
        file_bucket: 'uploads',
        file_type: file.type,
        category: category 
      }])
      .select()
      .single();

    if (dbError) {
      // Código de erro de violação de FK no PostgreSQL
      if (dbError.code === '23503') {
        console.info("ℹ️ Usuário Convidado: Documento analisado pela IA mas metadados não salvos por restrição de conta.");
      } else {
        console.warn("⚠️ Database Error:", dbError.message);
      }
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("❌ Critical Storage Service Error:", err);
    return null;
  }
};

/**
 * Upload de PDF gerado para compartilhamento via link.
 */
export const uploadGeneratedPDF = async (blob: Blob, userId: string, fileName: string) => {
    if (!supabase) return null;

    try {
      const filePath = `cv-exports/${userId}/${Date.now()}-${fileName}`;

      const { error: uploadError } = await supabase
          .storage
          .from('uploads')
          .upload(filePath, blob, {
              contentType: 'application/pdf',
              upsert: true
          });

      if (uploadError) return null;

      const { data: { publicUrl } } = supabase
          .storage
          .from('uploads')
          .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("❌ PDF Upload Error:", err);
      return null;
    }
};
