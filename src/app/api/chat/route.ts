// File: src/app/api/chat/route.ts
// Claude API endpoint for chat integration

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, episodeTitle, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation context
    const systemPrompt = `You are a helpful learning assistant for the Meridian Learning platform. The student is currently watching: "${episodeTitle}".

Your role:
- Answer questions about the current episode and related programming concepts
- Provide clear, concise explanations suitable for learners
- Encourage critical thinking and deeper understanding
- Be friendly and supportive
- Keep responses focused and practical

Guidelines:
- Responses should be 2-4 paragraphs maximum
- Use simple language and concrete examples
- If asked about topics outside the current episode, gently redirect to the lesson content
- Encourage students to apply what they're learning`;

    // Format conversation history for Claude API
    const messages = [];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API with streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Enable streaming responses
export const runtime = 'edge';
