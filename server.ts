import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-2.5-flash";


function getAiClient() {
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Missing Gemini API key in .env.local");
  }

  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const { role, type, difficulty } = req.body;

      if (!role || !type || !difficulty) {
        return res.status(400).send("Missing role, type, or difficulty");
      }

      const ai = getAiClient();

      const prompt = `Generate 5 ${difficulty}-level ${type} interview questions for a ${role}.
Return the response as a JSON array of objects, each with an 'id' (number) and 'text' (string).
Do not include any other text or markdown formatting.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
              },
              required: ["id", "text"],
            },
          },
        },
      });

      const questions = JSON.parse(response.text || "[]");
      res.json(questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      const message =
        error instanceof Error ? error.message : "Failed to generate questions";
      res.status(500).send(message);
    }
  });

  app.post("/api/evaluate", async (req, res) => {
    try {
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).send("Missing question or answer");
      }

      const ai = getAiClient();

      const prompt = `Evaluate the following interview answer for the question: "${question}".
Answer: "${answer}"
Return the response as a JSON object with:
- 'score' (number out of 100)
- 'strengths' (array of strings)
- 'improvements' (array of strings)
- 'feedback' (string, 2-3 lines)
Do not include any other text or markdown formatting.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              feedback: { type: Type.STRING },
            },
            required: ["score", "strengths", "improvements", "feedback"],
          },
        },
      });

      const evaluation = JSON.parse(response.text || "{}");
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      const message =
        error instanceof Error ? error.message : "Failed to evaluate answer";
      res.status(500).send(message);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
