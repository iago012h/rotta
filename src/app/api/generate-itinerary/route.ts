import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destino, duracao, orcamento, pessoas } = body;

    if (!destino || !duracao || !orcamento) {
      return NextResponse.json({ error: 'Faltam parâmetros (destino, duracao, orcamento)' }, { status: 400 });
    }

    const prompt = `
      Atue como o melhor agente de viagens do mundo.
      
      Destino: ${destino}
      Duração: ${duracao}
      Quantidade de Pessoas: ${pessoas}
      Orçamento Total da Viagem (em Reais - BRL, PARA TODAS AS PESSOAS JUNTAS): ${orcamento}
      
      Regras CRÍTICAS de Realismo e Dinheiro:
      1. A moeda é REAIS (R$). Você DEVE ter noção da realidade econômica.
      2. Se o usuário colocar R$ 2, R$ 50 ou orçamentos inviáveis para destinos longe (ex: Japão com 1000 reais), NÃO INVENTE LUXO. Diga explicitamente no 'description' que o orçamento mal cobre a passagem, e faça um roteiro de "Mochileiro Extremo" focado em coisas 100% gratuitas (caminhadas, parques) e comer pão do mercado.
      3. Seja rigoroso. Se não dá pra comer em restaurante, coloque comida de rua. 
      4. Estime o valor de CADA atividade (passagem de ônibus, ingresso do museu, prato no restaurante) na chave 'estimatedCost'.
      
      Regras de Estrutura:
      1. Agrupe as atrações geograficamente por dia.
      2. Seja descritivo e dê dicas locais.
      3. Se a opção for SURPREENDA-ME, escolha um destino que CAIBA no orçamento informado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { 
              type: Type.STRING, 
              description: 'Resumo do roteiro e um "Choque de Realidade" se o orçamento for irreal para o destino.' 
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        time: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING },
                        estimatedCost: { type: Type.STRING, description: 'Ex: R$ 0, R$ 45, R$ 120' },
                        type: { type: Type.STRING, enum: ['food', 'sightseeing', 'transit'] }
                      },
                      required: ['title', 'time', 'description', 'location', 'estimatedCost', 'type']
                    }
                  }
                },
                required: ['dayNumber', 'title', 'theme', 'summary', 'events']
              }
            }
          },
          required: ['title', 'description', 'days']
        }
      }
    });

    const itineraryData = JSON.parse(response.text || '{}');

    return NextResponse.json(itineraryData);

  } catch (error: any) {
    console.error('Erro na geração com Gemini:', error);
    return NextResponse.json({ 
      error: 'Falha ao gerar roteiro', 
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
