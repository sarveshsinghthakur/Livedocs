import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Initialize Google Generative AI client with an API key from the environment variables
      const genAI = new GoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      // Extract the prompt from the request body
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Generate text using the prompt
      const response = await genAI.generateText({
        model: "models/gemini-1.5-flash", // Ensure the model name is correct
        prompt: prompt,
      });

      // Check if the response has content
      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error("Invalid response from generative AI model");
      }

      // Respond with the generated text
      res.status(200).json({ text: response.candidates[0].output });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}