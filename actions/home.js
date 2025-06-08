"use server";
import { db } from "../components/lib/prisma";
import { serializedCarData } from "../components/lib/helper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { request } from "@arcjet/next";
import aj from "@/components/lib/arcject";

async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}
export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await db.car.findMany({
      where: {
        status: "published",
        featured: true,
        status: "AVAILABLE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return cars.map(serializedCarData);
  } catch (error) {
    console.error("Error fetching featured cars:", error);
  }
}

export async function processImageSearch(file) {
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      requested: 1,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error("Request denied by Arcjet");
    }
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    const prompt = `
            Analyze this car image and extract the following information for a search query:
              1. Make (manufacturer)
              2. BodyType (SUV, Sedan, Hatchback, etc.)
              3. Color

              Format your response as a clean JSON object with these fields:
              {
                "make": "",
                "bodyType": "",
                "color": "",
                "confidence": 0.0
              }

              For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
              Only respond with the JSON object, nothing else.`;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = JSON.parse(cleanedText);

      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
    }
    return {
      success: false,
      error: "Failed to parse AI response",
    };
  } catch (error) {
    console.error("AI search error:", error.message);
  }
}
