import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class AiService {
  async askAssistant(message: string, userId?: string) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return {
        source: 'local-fallback',
        answer:
          'AI көмекшісі әлі конфигурацияланбаған. N8N_WEBHOOK_URL және N8N/OPENAI API кілттерін орнатыңыз.',
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userId: userId ?? 'anonymous',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `N8N webhook қатесі: ${response.status}`,
      );
    }

    const data = (await response.json().catch(() => ({}))) as {
      answer?: string;
      output?: string;
      text?: string;
    };

    return {
      source: 'n8n',
      answer: data.answer ?? data.output ?? data.text ?? 'Жауап бос болып келді',
    };
  }
}
