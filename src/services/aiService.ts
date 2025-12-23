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