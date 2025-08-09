import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(promptOrMessages) {
  let promptText = "";

  // If the input is an array (conversation history)
  if (Array.isArray(promptOrMessages)) {
    const conversation = promptOrMessages
      .map(m => `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`)
      .join("\n");
    promptText = conversation;
  } 
  // If the input is already a string
  else if (typeof promptOrMessages === "string") {
    promptText = promptOrMessages;
  } 
  // Fallback for bad input
  else {
    console.warn("askGemini received invalid input:", promptOrMessages);
    promptText = "";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const result = await model.generateContent(promptText);
  const response = await result.response;
  return response.text();
}
