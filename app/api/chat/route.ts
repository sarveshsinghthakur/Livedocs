import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Initialize Google Generative AI client
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      // Get the generative model
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Extract prompt from request body
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Define the image data (assuming the image is always the same)
      const image = {
        inlineData: {
          data: fs.readFileSync("public/cookie.png").toString("base64"),
          mimeType: "image/png",
        },
      };

      // Run the prompt and generate content
      const result = await model.generateContent([prompt, image]);

      // Respond with the generated text
      res.status(200).json({ text: result.response.text() });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
