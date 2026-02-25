import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ShortStrategy {
  id: number;
  problem: string;
  hook: string;
  script: {
    voiceover: string;
    scenes: string;
  };
  seo: {
    title: string;
    keywords: string[];
    tags: string[];
    description: string;
  };
  thumbnail: {
    text: string;
    imageIdea: string;
    emotion: string;
  };
}

export async function generateShortsStrategy(topic: string): Promise<ShortStrategy[]> {
  const prompt = `You are an expert YouTube Shorts strategist, SEO specialist, and cinematic script writer.
INPUT:
Topic: ${topic}

TASK:
Identify the TOP 5 real problems people face in this topic.
For each problem:
Write a CINEMATIC YouTube Shorts script (20–30 sec)
Use emotional storytelling + simple explanation
Include VOICEOVER lines
Add scene directions for visuals

For each Short generate:
A. SEO Title (high CTR, emotional, searchable)
B. High-traffic low-competition keywords
C. Tags (SEO optimized)
D. Description (SEO + engaging)
E. Thumbnail concept:
Thumbnail text (3–5 words)
Thumbnail image idea (clear visual description)
Emotion to show
F. Hook line for first 2 seconds

STYLE:
Simple English
Cinematic storytelling
Fast-paced YouTube Shorts format
Focus on problem -> realization -> solution -> motivation
Avoid generic advice, be practical and visual

Before generating titles, identify:
High search intent keywords
Long-tail keywords with low competition
Keywords popular in India + global audience
Short-form YouTube trending search phrases
Use these keywords naturally in titles, tags, and description.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            problem: { type: Type.STRING },
            hook: { type: Type.STRING },
            script: {
              type: Type.OBJECT,
              properties: {
                voiceover: { type: Type.STRING },
                scenes: { type: Type.STRING }
              },
              required: ["voiceover", "scenes"]
            },
            seo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING }
              },
              required: ["title", "keywords", "tags", "description"]
            },
            thumbnail: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imageIdea: { type: Type.STRING },
                emotion: { type: Type.STRING }
              },
              required: ["text", "imageIdea", "emotion"]
            }
          },
          required: ["id", "problem", "hook", "script", "seo", "thumbnail"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text);
}

export async function generateThumbnailImage(concept: ShortStrategy['thumbnail'], topic: string): Promise<string> {
  const prompt = `Create a cinematic YouTube Shorts thumbnail.
Topic: ${topic}
Image Idea: ${concept.imageIdea}
Emotion: ${concept.emotion}
Mood: High contrast, emotional, dramatic lighting
Style: Realistic, sharp focus, vibrant colors
Expression: Strong human emotion (shock, curiosity, excitement)
Text Space: Leave space for bold 3-word text
Background: Simple but dramatic`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
}
