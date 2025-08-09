import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(messages) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  // Convert message history into a readable chat format
  const chatPrompt = messages
    .map(m => `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");

  const result = await model.generateContent(chatPrompt);
  const response = await result.response;
  const text = response.text();

  return text;
}
