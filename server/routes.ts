import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Transcribe Endpoint ---
  app.post(api.transcribe.upload.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert buffer to base64
      const audioBase64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      // Call Gemini for transcription
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Transcribe this audio exactly. Do not add any commentary." },
              { 
                inlineData: {
                  mimeType: mimeType,
                  data: audioBase64
                }
              }
            ]
          }
        ]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json({ text });

    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // --- Case Endpoints ---

  app.get(api.cases.list.path, async (req, res) => {
    const cases = await storage.listCases();
    res.json(cases);
  });

  app.get(api.cases.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const caseItem = await storage.getCase(id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(caseItem);
  });

  app.post(api.cases.create.path, async (req, res) => {
    try {
      const input = api.cases.create.input.parse(req.body);
      const newCase = await storage.createCase(input);

      // Trigger Async Analysis
      analyzeCase(newCase.id, input).catch(err => 
        console.error(`Background analysis failed for case ${newCase.id}:`, err)
      );

      res.status(201).json(newCase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Create case error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

// --- Helper: AI Analysis ---

async function analyzeCase(caseId: number, data: any) {
  try {
    await storage.updateCaseStatus(caseId, "analyzing");

    const prompt = `
      You are a specialized medical reasoning agent "Case → Care".
      Analyze the following patient case data.
      
      Patient: ${data.patientName}, Age: ${data.patientAge || "Unknown"}
      Clinical Notes: ${data.clinicalNotes || "None"}
      Patient Voice Transcript: ${data.transcript || "None"}

      Your task:
      1. Synthesize a brief clinical summary.
      2. Identify diagnostic blind spots or potential biases (e.g., anchoring bias, premature closure).
      3. Generate 3-5 clear, relevant follow-up questions for the clinician to ask the patient or check.
      4. Detect the primary language of the transcript.

      Return the output as valid JSON with this structure:
      {
        "summary": "...",
        "blindSpots": ["..."],
        "questions": ["..."],
        "originalLanguage": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = JSON.parse(resultText);

    await storage.createInsight(caseId, {
      summary: result.summary,
      blindSpots: result.blindSpots,
      questions: result.questions,
      originalLanguage: result.originalLanguage
    });

    await storage.updateCaseStatus(caseId, "completed");

  } catch (error) {
    console.error(`Analysis failed for case ${caseId}:`, error);
    await storage.updateCaseStatus(caseId, "failed");
  }
}

// Seed Data
async function seedDatabase() {
  const cases = await storage.listCases();
  if (cases.length === 0) {
    const seed = await storage.createCase({
      title: "Chest Pain - 45M",
      patientName: "John Doe",
      patientAge: 45,
      clinicalNotes: "Patient complains of chest tightness. ECG normal.",
      transcript: "I've been feeling this pressure in my chest when I walk up stairs. It goes away when I rest. Also my left arm feels a bit heavy.",
      status: "pending"
    });
    
    // Trigger analysis for seed
    analyzeCase(seed.id, {
      patientName: "John Doe",
      patientAge: 45,
      clinicalNotes: "Patient complains of chest tightness. ECG normal.",
      transcript: "I've been feeling this pressure in my chest when I walk up stairs. It goes away when I rest. Also my left arm feels a bit heavy."
    });
  }
}

setTimeout(seedDatabase, 1000);
