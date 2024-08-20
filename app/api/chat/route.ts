import { openai } from "@ai-sdk/openai";
import {  streamText, streamToResponse } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = await streamText({
      model: openai("gpt-3.5-turbo-0125"),
      messages,
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

