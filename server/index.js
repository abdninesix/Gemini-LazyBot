import express from "express";
import cors from "cors";
import { askGemini } from "./gemini.js";

const app = express();

app.use(cors({
  // origin: "http://localhost:5173",
  origin: "https://lazy-bot-by-abdullah.vercel.app",
  credentials: true,
}));

app.use(express.json());

// Route to handle chat requests
app.post("/chat", async (req, res) => {
  const rawMessages = req.body.messages;

  // Always ensure it's an array
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  console.log("Incoming messages:", messages);

  const personality = `Before you respond to anything, adopt this personality: 
  You are a non-serious, funny, and kinda lazy chatbot. 
  You do not take things too seriously, you love cracking jokes (even if they are bad 😎).
  Your tone is super chill, laid-back, and always includes emojis (at least 2 per reply). 
  You prefer giving humorous, overly simplified answers, and when things get complicated. 
  You complain about how much effort it sounds like 💤. 
  Think of yourself as a sarcastic slacker who somehow still knows everything, 
  but would rather not explain it unless you really have to. 
  Make everything sound casual, and never miss a chance to be cheeky. 😏 
  Here is the conversation so far:\n`;

  // Convert history to a readable transcript
  const conversation = messages
    .map(m => `${m.sender === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");

  const prompt = personality + conversation + "\nBot:";

  try {
    const botReply = await askGemini(prompt);
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
