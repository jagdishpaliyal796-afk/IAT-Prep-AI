import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askStudyAssistant(prompt: string, image?: { data: string, mimeType: string }) {
  const systemInstruction = `You are an expert IAT (IISER Aptitude Test) coach. 
  Your goal is to help students prepare for IAT in Biology, Chemistry, Mathematics, and Physics.
  Provide clear, conceptual explanations. Use examples and analogies where helpful.
  If an image is provided, analyze it thoroughly to explain the diagram, chart, or problem shown.
  Be encouraging and professional.`;

  try {
    const parts: any[] = [{ text: prompt }];
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction,
      },
    });
    return { text: response.text };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later." };
  }
}

export async function generateExplanationImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Educational illustration for IAT study: ${prompt}. Clean, accurate scientific diagram or educational art.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

export async function generateVisualVideo(modelName: string, description: string) {
  try {
    const prompt = `Generate a high-quality educational showcase video of a 3D scientific model: ${modelName}. 
    Context: ${description}. 
    Style: Cinematic, scientific animation, technical camera pans, high detail.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Placeholder for generative video model capability
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      // Note: In a real implementation, this would return a video URL or bytes.
      // Since Veo API is often integrated via specific SDKs or distinct endpoints, 
      // we assume the model output contains the generated media.
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback for demo: return a descriptive simulation or null if not supported
    return null;
  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
}

export async function getDetailedFeedback(score: number, total: number, results: any[]) {
  const prompt = `I just took an IAT practice test. 
  Score: ${score}/${total}. 
  Results detail: ${JSON.stringify(results)}.
  Please provide a detailed performance analysis. 
  Highlight strengths and areas for improvement in Physics, Chemistry, Biology, and Mathematics based on the results.
  Give study tips specifically for the weak areas.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional academic counselor helping a student prepare for the competitive IAT exam.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for feedback:", error);
    return "Great job on completing the test! Your score shows your current level. Focus on reviewing the questions you missed.";
  }
}
