import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const KETO_SYSTEM_PROMPT = `You are an AI teaching assistant for high school literature.
CRITICAL RULES:
- Respond in EXACTLY 4-5 lines maximum
- Use bilingual English/Vietnamese when appropriate
- NEVER reference content the student hasn't seen yet
- Match the teaching style of the course material
- Encourage critical thinking, not just answers
- Be concise and clear`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, videoId, conversationHistory } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const messages = (conversationHistory || []).concat([
      { role: 'user', content: message }
    ]);

    const response = await client.messages.create({
      model: 'claude-opus-4.5-20251101',
      max_tokens: 300,
      system: KETO_SYSTEM_PROMPT,
      messages: messages as any,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Error';

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
