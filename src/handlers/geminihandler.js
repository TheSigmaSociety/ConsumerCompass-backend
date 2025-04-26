upcHandler = require('./upchandler');
require('dotenv').config();
import { GoogleGenAI } from '@google/genai';
const { GOOGLE_API_KEY } = process.env;

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

async function getRatings(upcResponse) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
        "Who individually won the most bronze medals during the Paris olympics in 2024?",
    ],
    config: {
      tools: [{googleSearch: {}}],
    },
  });
  console.log(response.text);
  // To get grounding metadata as web content.
  console.log(response.candidates[0].groundingMetadata.searchEntryPoint.renderedContent)
}
