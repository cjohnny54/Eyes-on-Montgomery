import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: "Provide exactly one real, valid URL to a tweet (status) from the official @CityofMGM Twitter account. Only output the URL, nothing else."
  });
  console.log(response.text);
}
run();
