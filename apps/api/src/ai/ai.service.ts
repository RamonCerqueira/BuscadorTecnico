import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GOOGLE_AI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || 'MOCK_KEY');
  }

  async getDiagnostic(description: string, isTechnician?: boolean) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = isTechnician
        ? `
        Aja como um engenheiro especialista sênior. Um técnico de campo relatou o seguinte sintoma/problema em um equipamento: "${description}".
        Forneça uma análise técnica avançada (máximo 800 caracteres) incluindo:
        1. Prováveis componentes defeituosos ou falhas lógicas.
        2. Procedimentos e testes de bancada/multímetro recomendados.
        3. Dicas de segurança ou possíveis pegadinhas comuns deste defeito.
        
        Responda utilizando jargões técnicos adequados de forma direta e estruturada. Formate a resposta de modo legível.
        `
        : `
        Aja como um assistente técnico especializado. Um cliente descreveu o seguinte problema: "${description}".
        Forneça um pré-diagnóstico curto (máximo 400 caracteres) incluindo:
        1. Possível causa.
        2. Categoria do profissional necessário (Ex: Eletricista, Encanador).
        3. Nível de urgência (Baixo, Médio, Alto).
        
        Responda em um formato amigável para o cliente no Brasil.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Erro ao chamar Google Gemini API', error);
      return 'Não foi possível gerar um diagnóstico automático no momento.';
    }
  }

  async analyzeSelfieLiveness(selfieUrl: string): Promise<{ isVerified: boolean; details: string }> {
    try {
      const response = await fetch(selfieUrl);
      if (!response.ok) throw new Error('Não foi possível fazer download da selfie');
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Analise a imagem fornecida. Esta imagem deve ser uma selfie tirada por um humano para fins de verificação de identidade em um aplicativo de serviços.
        Responda exclusivamente no formato JSON com os seguintes campos:
        {
          "isHuman": boolean,
          "isSelfie": boolean,
          "livenessDetected": boolean,
          "confidence": number,
          "reason": string
        }
        
        Certifique-se de que a resposta contenha apenas o JSON puro, sem marcações markdown de código.
      `;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ]);
      
      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        isVerified: parsed.isHuman && parsed.isSelfie && parsed.livenessDetected && parsed.confidence > 0.7,
        details: parsed.reason || 'Validação facial concluída.'
      };
    } catch (error) {
      this.logger.error('Erro ao validar selfie/liveness via Gemini', error);
      return { isVerified: false, details: 'Falha técnica ao analisar a selfie.' };
    }
  }

  async analyzeDocumentKyc(documentUrl: string, expectedName: string): Promise<{ isVerified: boolean; details: string }> {
    try {
      const response = await fetch(documentUrl);
      if (!response.ok) throw new Error('Não foi possível fazer download do documento');
      const buffer = Buffer.from(await response.arrayBuffer());
      
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Analise o documento fornecido. Este documento deve ser uma credencial profissional, certificado ou documento de identidade de um prestador de serviços.
        O nome esperado no documento é: "${expectedName}".
        Responda exclusivamente no formato JSON com os seguintes campos:
        {
          "isValidDocument": boolean,
          "extractedName": string,
          "nameMatches": boolean,
          "documentType": string,
          "confidence": number,
          "reason": string
        }
        
        Certifique-se de que a resposta contenha apenas o JSON puro, sem marcações markdown de código.
      `;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ]);
      
      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      return {
        isVerified: parsed.isValidDocument && parsed.nameMatches && parsed.confidence > 0.7,
        details: `${parsed.documentType} analisado. Extraído: ${parsed.extractedName}. Observação: ${parsed.reason}`
      };
    } catch (error) {
      this.logger.error('Erro ao validar documento via Gemini', error);
      return { isVerified: false, details: 'Falha técnica ao analisar o documento.' };
    }
  }

  async matchTechnicians(
    ticketDescription: string,
    professionals: Array<{ id: string; name: string; specialties: string[]; bio: string | null }>
  ): Promise<{ matchedIds: string[]; reason: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analise o seguinte chamado técnico e selecione os 3 profissionais mais compatíveis da lista fornecida.
        
        Descrição do chamado: "${ticketDescription}"
        
        Profissionais:
        ${JSON.stringify(professionals.map(p => ({ id: p.id, name: p.name, specialties: p.specialties, bio: p.bio })))}
        
        Responda exclusivamente no formato JSON com os seguintes campos:
        {
          "matchedIds": ["id1", "id2", "id3"],
          "reason": "Explicação curta do motivo da compatibilidade com o top 1"
        }
        
        Certifique-se de que a resposta contenha apenas o JSON puro, sem marcações markdown de código.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        matchedIds: parsed.matchedIds || [],
        reason: parsed.reason || 'Compatibilidade gerada por IA.'
      };
    } catch (error) {
      this.logger.error('Erro ao fazer match automático com IA', error);
      return { matchedIds: [], reason: 'Não foi possível rodar o match automático no momento.' };
    }
  }

  async generateServiceReport(
    ticket: { title: string; description: string; category: string | null },
    clientName: string,
    providerName: string,
    messages: Array<{ senderName: string; content: string; createdAt: Date }>
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Gere um laudo técnico oficial profissional para o seguinte chamado concluído:
        
        Título do chamado: "${ticket.title}"
        Categoria: "${ticket.category || 'Geral'}"
        Descrição Inicial: "${ticket.description}"
        Cliente: "${clientName}"
        Técnico Responsável: "${providerName}"
        
        Conversa histórica do chat técnico (para documentar o processo e resolução):
        ${JSON.stringify(messages.map(m => ({ de: m.senderName, msg: m.content, data: m.createdAt })))}
        
        O relatório deve estar no formato Markdown limpo contendo:
        1. Cabeçalho oficial "LAUDO TÉCNICO DE SERVIÇO - TECHFIX"
        2. Resumo da Ordem de Serviço
        3. Diagnóstico e Problema Constatado
        4. Etapas da Execução Técnica Realizada (deduzido com base no chat)
        5. Peças e Insumos Utilizados (se houver, deduzidos ou geral)
        6. Conclusão, Recomendações de Manutenção Preventiva e Assinatura TechFix
        
        Responda em Português do Brasil com tom formal e profissional de engenharia/técnico.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Erro ao gerar laudo técnico automático via Gemini', error);
      return 'Não foi possível gerar o laudo técnico automático.';
    }
  }

  async suggestPricing(
    category: string,
    description: string,
    city: string
  ): Promise<{ minPrice: number; maxPrice: number; reason: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Como um especialista de precificação de serviços técnicos no Brasil, estime a faixa de preço média em Reais (BRL) para o seguinte serviço:
        
        Categoria: "${category}"
        Descrição: "${description}"
        Cidade/Região: "${city}"
        
        Responda exclusivamente no formato JSON com os seguintes campos:
        {
          "minPrice": number,
          "maxPrice": number,
          "reason": "Explicação resumida em 1 frase da precificação baseada no mercado local"
        }
        
        Certifique-se de que a resposta contenha apenas o JSON puro, sem marcações markdown de código.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        minPrice: parsed.minPrice || 100,
        maxPrice: parsed.maxPrice || 300,
        reason: parsed.reason || 'Preço estimado com base em serviços similares.'
      };
    } catch (error) {
      this.logger.error('Erro ao sugerir faixa de preço via Gemini', error);
      return { minPrice: 100, maxPrice: 300, reason: 'Faixa estimada padrão para serviços gerais.' };
    }
  }

  async generateProposal(notes: string, ticketDescription: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Você atua como um assistente profissional da plataforma TechFix. 
        Um técnico quer enviar uma proposta de orçamento para um cliente.
        
        Problema relatado pelo cliente: "${ticketDescription}"
        Anotações rascunhadas do técnico: "${notes}"
        
        Escreva uma proposta final educada, clara e persuasiva baseada nessas anotações, pronta para o cliente ler. 
        Não invente valores ou prazos não mencionados nas anotações, use apenas o que foi fornecido.
        Corrija erros gramaticais das anotações e estruture em 1 ou 2 parágrafos curtos e diretos, focando em profissionalismo.
        
        Responda apenas com o texto da proposta final.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      this.logger.error('Erro ao gerar proposta automática via Gemini', error);
      return notes;
    }
  }
}
