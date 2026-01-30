import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, episodeTitle, episodeTranscript } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a learning assistant for Meridian Learning, an AI-enhanced education platform.

Your role:
- Help students understand ${episodeTitle || "the lesson"}
- Ask clarifying questions to deepen understanding
- Encourage critical thinking
- Keep responses concise (4-5 lines maximum)
- Use simple, clear language

Important constraints:
- Only reference content from the current episode
- Do not jump ahead to future topics
- If asked about content not yet covered, guide student back to current material
- Respond in English and Vietnamese (if student uses Vietnamese)

Episode context:
${episodeTranscript || "No transcript available"}`;

    const response = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 200,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ response: textContent.text });
  } catch (error) {
    console.error("Error calling Claude:", error);
    return NextResponse.json(
      { error: "Failed to get response from Claude" },
      { status: 500 }
    );
  }
}
