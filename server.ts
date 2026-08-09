import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing in environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, persona } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Map messages into Gemini contents or format prompt
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const personaInstructions: Record<string, string> = {
      assistant: "You are a versatile, friendly, and expert AI Assistant. Provide structured, concise, and highly useful answers.",
      coder: "You are an elite Senior Software Engineer and Code Architect. Provide bug-free code examples, clean architecture advice, and concise explanations with code blocks.",
      copywriter: "You are a master Marketing Copywriter and Brand Strategist. craft persuasive, punchy, high-converting copy with captivating headlines and clear calls to action.",
      creative: "You are a Creative Director and Prompt Designer. Provide innovative, vivid, and highly expressive ideas and prompt suggestions.",
      business: "You are a Strategy & Growth Consultant. Give sharp, actionable business advice, financial metrics insights, and go-to-market strategies.",
    };

    const finalInstruction =
      systemInstruction ||
      personaInstructions[persona] ||
      personaInstructions.assistant;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: `${finalInstruction}\nFormat output in clear Markdown with headers, bullet points, and code blocks where applicable.`,
      },
    });

    return res.json({
      text: response.text || "No response generated.",
      usage: { promptTokens: 1, totalTokens: 1 },
    });
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    return res.status(500).json({
      error: err.message || "Failed to process chat request.",
    });
  }
});

// Prompt Generator Route
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const {
      targetPlatform,
      coreIdea,
      toneStyle,
      detailLevel,
      aspectRatio,
      cameraAngle,
      lighting,
      negativePrompt,
      outputFormat,
    } = req.body;

    if (!coreIdea) {
      return res.status(400).json({ error: "Core idea is required." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a world-class Prompt Engineer specializing in multi-platform AI prompts (Midjourney, DALL-E 3, ChatGPT, Claude 3.5, Stable Diffusion, Copywriting, Code Specs).
Your mission is to take the user's raw idea and create an expertly crafted, high-performance prompt optimized for the requested platform.

Target Platform: ${targetPlatform || "ChatGPT / General AI"}
Tone/Style: ${toneStyle || "Balanced"}
Detail Level: ${detailLevel || "Detailed"}
Aspect Ratio / Params: ${aspectRatio || "Default"}
Camera/Lighting: ${cameraAngle || "N/A"}, ${lighting || "N/A"}
Negative Prompt / Constraints: ${negativePrompt || "None"}
Desired Output Format: ${outputFormat || "Standard Text"}

Return a JSON object with the following fields:
{
  "masterPrompt": "The primary optimized prompt ready to copy and use.",
  "breakdown": [
    {"part": "Role / Persona", "description": "..."},
    {"part": "Core Task & Context", "description": "..."},
    {"part": "Formatting & Output Rules", "description": "..."}
  ],
  "negativePrompt": "Excluded elements or constraints if applicable",
  "recommendedSettings": "Key parameters like temperature, aspect ratio --ar, model version, or system prompt placement",
  "usageTips": ["Tip 1 on how to get best results", "Tip 2 on tweaking variables"],
  "variants": [
    "Short/Punchy Variant prompt",
    "Extreme Detail Variant prompt"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Raw Idea: ${coreIdea}\nPlatform: ${targetPlatform}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ result: parsed });
  } catch (err: any) {
    console.error("Error in /api/generate-prompt:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate optimized prompt.",
    });
  }
});

// AI Tools Suite Route
app.post("/api/tool/run", async (req, res) => {
  try {
    const { toolId, input, options } = req.body;

    if (!toolId || !input) {
      return res.status(400).json({ error: "toolId and input are required." });
    }

    const ai = getGeminiClient();

    let systemInstruction = "";

    switch (toolId) {
      case "summarizer":
        systemInstruction =
          "You are an executive summarizer. Provide an Executive Overview (2-3 sentences), 5 Key Takeaways, Actionable Next Steps, and a 1-sentence TL;DR.";
        break;
      case "code-refactor":
        systemInstruction =
          "You are an expert code refactorer and security reviewer. Analyze the code, identify bugs/anti-patterns, provide clean optimized code, and list performance & readability improvements.";
        break;
      case "brand-namer":
        systemInstruction =
          "You are a creative brand naming agency. Generate 10 catchy, unique brand/startup names categorized by style (Modern, Playful, Premium, Tech, Compound), along with slogan suggestions and domain availability hints.";
        break;
      case "email-outreach":
        systemInstruction =
          "You are a high-converting cold email strategist. Write 3 distinct email variations (Short & Punchy, Value-First, Casual/Friendly) with high-open-rate Subject Lines and clear Calls to Action.";
        break;
      case "social-thread":
        systemInstruction =
          "You are a viral social media growth manager. Turn the input into an engaging 5-tweet X/Twitter thread or LinkedIn post with hooks, formatting, hashtags, and call-to-action.";
        break;
      case "seo-outline":
        systemInstruction =
          "You are a Senior SEO Content Strategist. Produce a comprehensive SEO Blog Outline with Target Keywords, Meta Title/Description, H1/H2/H3 Heading structure, and Key Points to cover per section.";
        break;
      case "art-specifier":
        systemInstruction =
          "You are an Art Director & Style Specifier. Analyze the concept and provide detailed artistic style parameters: Lighting, Camera Lens, Rendering Engine (Octane/Unreal 5), Color Palette, Mood, and Composition.";
        break;
      default:
        systemInstruction =
          "You are an AI assistant. Fulfill the user request with high precision and clarity in Markdown.";
        break;
    }

    const extraPrompt = options
      ? `\nAdditional Custom Instructions: ${JSON.stringify(options)}`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${input}${extraPrompt}`,
      config: {
        systemInstruction: `${systemInstruction}\nUse clean, visually appealing Markdown formatting with bolding, lists, and headings.`,
      },
    });

    return res.json({
      result: response.text || "No output generated.",
    });
  } catch (err: any) {
    console.error("Error in /api/tool/run:", err);
    return res.status(500).json({
      error: err.message || "Failed to execute AI tool.",
    });
  }
});

// -------------------------------------------------------------
// VITE & SERVER INITIALIZATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Tools Hub] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
