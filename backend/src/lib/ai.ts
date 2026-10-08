import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateSkillGapAnalysis(payload: {
  currentSkills: string[];
  targetRole: string;
  readinessScore: number;
}) {
  if (!ai || !apiKey) {
    // Return high-quality structured mock analysis if GEMINI_API_KEY is not yet configured
    return {
      targetRole: payload.targetRole,
      currentReadiness: payload.readinessScore,
      projectedReadiness: Math.min(100, payload.readinessScore + 18),
      criticalGaps: [
        { skill: "Automated Testing (Jest / Cypress)", priority: "High", timeEstimateWeeks: 2 },
        { skill: "Docker & Containerization", priority: "Medium", timeEstimateWeeks: 2 },
        { skill: "System Architecture & API Security", priority: "High", timeEstimateWeeks: 3 },
      ],
      strengths: payload.currentSkills.slice(0, 3),
      recommendedActionPlan: [
        "Complete the 10-day Advanced Testing & CI/CD module",
        "Build a containerized full-stack project with verified evidence",
        "Take the SkillImprove System Design assessment to verify readiness",
      ],
      aiAdvice: `Alex, your foundation in ${payload.currentSkills.join(", ")} is strong! Focusing on testing frameworks and system integration will accelerate your match rate for ${payload.targetRole} roles above 90%.`,
      isMock: true,
    };
  }

  const prompt = `You are the lead career & skill advisory AI for SkillImprove.
Analyze this student's profile:
- Target Role: "${payload.targetRole}"
- Current Skills: ${payload.currentSkills.join(", ")}
- Current Readiness Score: ${payload.readinessScore}%

Provide a structured JSON output with:
- targetRole: string
- currentReadiness: number
- projectedReadiness: number
- criticalGaps: array of objects with { skill: string, priority: "High" | "Medium" | "Low", timeEstimateWeeks: number }
- strengths: array of string
- recommendedActionPlan: array of strings (actionable steps)
- aiAdvice: string (personalized, encouraging, direct guidance)

Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return { ...JSON.parse(text), isMock: false };
  } catch (err: any) {
    console.error("Gemini API error, falling back:", err?.message);
    return {
      targetRole: payload.targetRole,
      currentReadiness: payload.readinessScore,
      projectedReadiness: Math.min(100, payload.readinessScore + 15),
      criticalGaps: [
        { skill: "Automated Testing", priority: "High", timeEstimateWeeks: 2 },
        { skill: "Microservices Architecture", priority: "Medium", timeEstimateWeeks: 3 },
      ],
      strengths: payload.currentSkills,
      recommendedActionPlan: [
        "Complete the Testing & CI/CD curriculum",
        "Verify your skills with our assessment tests",
      ],
      aiAdvice: "We encountered a temporary rate limit, but your skill profile is well-aligned. Focus on closing your testing gap.",
      isMock: true,
    };
  }
}

export async function generateQuizQuestions(topic: string, count: number = 3) {
  if (!ai || !apiKey) {
    return {
      topic,
      questions: [
        {
          prompt: `In modern ${topic}, what is the best practice for state management in high-concurrency scenarios?`,
          options: [
            "Global shared mutable state without synchronization",
            "Immutable state trees with unidirectional data flow",
            "Polling persistent disk storage on every render",
            "Storing state entirely inside DOM attributes",
          ],
          correctIndex: 1,
          explanation: "Unidirectional data flow and immutable updates prevent race conditions and make state transitions predictable.",
        },
        {
          prompt: `Which approach best optimizes network I/O in distributed ${topic} applications?`,
          options: [
            "Sending uncompressed redundant payload structures",
            "Connection pooling, caching, and batching API requests",
            "Opening a separate raw socket for each single HTTP request",
            "Synchronously blocking the main event thread",
          ],
          correctIndex: 1,
          explanation: "Connection pooling and intelligent caching drastically reduce handshake latency and socket exhaustion.",
        },
      ],
      isMock: true,
    };
  }

  const prompt = `Generate ${count} rigorous multiple-choice assessment questions for the topic: "${topic}".
Output must be a JSON object with:
- topic: string
- questions: array of { prompt: string, options: string[] (length 4), correctIndex: number (0-3), explanation: string }

Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return { ...JSON.parse(response.text || "{}"), isMock: false };
  } catch (err: any) {
    console.error("Gemini quiz generation error:", err?.message);
    return {
      topic,
      questions: [],
      error: "Could not generate questions dynamically",
      isMock: true,
    };
  }
}
