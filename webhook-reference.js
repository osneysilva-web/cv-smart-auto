
/**
 * LÓGICA DO WEBHOOK (Deploy em Supabase Edge Functions)
 * Endpoint: https://eanstwcksthsiekqnuga.supabase.co/functions/v1/webhook-lojou-cv
 */

/*
Deno.serve(async (req) => {
  const { status, external_id } = await req.json();

  if (status === 'paid' && external_id) {
    const { error } = await supabase
      .from('payments')
      .upsert({ 
        user_id: external_id, 
        status: 'paid',
        amount: 97.00 
      }, { onConflict: 'user_id' });

    return new Response("OK", { status: 200 });
  }
  return new Response("Ignored", { status: 200 });
})
*/
