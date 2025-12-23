// GERA CARTA DE APRESENTAÇÃO (já estava funcionando)
export async function generateCoverLetter(
  cvData: any,
  companyName: string,
  targetPosition: string,
  language: string
): Promise<string> {
  try {
    const response = await fetch('/api/cover-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvData,
        companyName,
        targetPosition,
        language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha na comunicação com o servidor');
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error('Erro ao gerar carta:', error);
    throw new Error(error.message || 'Erro inesperado ao gerar a carta de apresentação');
  }
}

// NOVO: EXTRAI DADOS DO BI (usa a API segura)
export async function extractPersonalData(files: File[]): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch('/api/extract-id', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Falha ao processar documento');
  }

  return await response.json();
}