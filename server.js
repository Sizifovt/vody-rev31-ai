import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

function levelRules(level) {
  const rules = {
    0: "Level 0 / Intuition: Do not start with a definition. Start with one concrete scene or familiar situation, show one small change or consequence, then state the idea. 1-3 short sentences. No jargon unless unavoidable.",
    1: "Level 1 / Familiarization: Simple factual explanation for an adult beginner. Use basic terms, one practical example, and short paragraphs. Avoid intimidation and avoid long textbook prose.",
    2: "Level 2 / Knowledge: More structured academic explanation. Include main parts, mechanisms, conditions, examples, and limits. Use necessary technical vocabulary but explain it clearly.",
    3: "Level 3 / Expertise: Precise expert explanation. State assumptions, models, edge cases, evidence, limitations, and distinctions from related ideas. Use domain terminology correctly."
  };
  return rules[level] || rules[0];
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  let text = "";
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && part.text) text += part.text;
      if (part.type === "text" && part.text) text += part.text;
    }
  }
  return text.trim();
}

function parseModelText(text, topic) {
  let answer = text;
  let subtopics = ["Basic idea", "Example", "Common mistake"];

  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.answer === "string" && parsed.answer.trim()) answer = parsed.answer.trim();
    if (Array.isArray(parsed.subtopics)) {
      subtopics = parsed.subtopics
        .map(x => typeof x === "string" ? x : (x?.title || x?.name || ""))
        .filter(Boolean)
        .slice(0, 3);
    }
  } catch {
    // Keep text as answer if the model did not return valid JSON.
  }

  if (!subtopics.length) subtopics = ["Basic idea", "Example", "Common mistake"];
  return { title: topic, answer, subtopics };
}

app.post("/api/vody-answer", async (req, res) => {
  try {
    const { topic, level, path: topicPath } = req.body || {};
    const cleanTopic = String(topic || "").trim();
    const numericLevel = Number.isInteger(level) ? level : Number(level);

    if (!cleanTopic) {
      return res.status(400).json({ error: "Missing topic." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    }

    const developerInstructions = `You are VODY, a natural learning platform. Explain the same subject at different resolution levels. Preserve the exact topic. Do not shift a specific topic into a generic category. For current facts, law, health, tax, politics, prices, or news, briefly state that current verification may be needed. Return valid JSON only, with this exact shape: {"answer":"...","subtopics":["...","...","..."]}. Do not include markdown headings.`;

    const userPrompt = `Topic: ${cleanTopic}\nSelected level: ${numericLevel}\nPath: ${(topicPath || []).join(" / ")}\nRule: ${levelRules(numericLevel)}\n\nCreate the answer for this selected level only. Also provide exactly three short subtopic labels for the knowledge map.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: developerInstructions }]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: userPrompt }]
          }
        ],
        max_output_tokens: 700
      })
    });

    const data = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      const message = data?.error?.message || `OpenAI request failed with status ${openaiResponse.status}.`;
      return res.status(502).json({ error: message });
    }

    const modelText = extractOutputText(data);
    if (!modelText) {
      return res.status(502).json({ error: "OpenAI response contained no output text." });
    }

    const parsed = parseModelText(modelText, cleanTopic);
    res.json({ ...parsed, source: "openai", model: MODEL });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`VODY Rev31 running at http://localhost:${PORT}`);
});
