import express from "express";
import cors from "cors";
import { askGemini } from "./gemini.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Route to handle chat requests
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const botReply = await askGemini(userMessage);
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
