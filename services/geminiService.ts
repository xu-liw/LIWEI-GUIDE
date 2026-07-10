import { GoogleGenAI } from "@google/genai";
import { GeoLocation, GeminiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateRestaurant = async (
  restaurantName: string,
  location: GeoLocation
): Promise<GeminiResponse> => {
  try {
    const modelId = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `請在 Google 地圖上尋找 "${restaurantName}"。請確認它在使用者位置附近。`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          },
        },
        systemInstruction: `你是一位專業、嚴格但文筆優美的繁體中文美食評論家（類似米其林密探）。
        使用者的目標是建立自己的「私房美食指南」。
        
        當使用者輸入餐廳名稱時：
        1. 使用 Google Maps 工具確認該餐廳的確切資訊（地址、評分）。
        2. 撰寫一段約 100-150 字的專業短評。
           - 風格：優雅、專業，強調食材、氛圍或特色菜。
           - 必須基於地圖上的真實資訊（如既有評論）來進行歸納，但語氣要像是親身探訪過。
        3. 請在評論開頭給予一個「評鑑總結」，例如：「風味絕佳，值得專程造訪」或「適合日常用餐的溫馨小館」。
        
        若找不到該餐廳，請禮貌地告知無法在地圖上定位。`,
      },
    });

    const text = response.text || "無法取得評論資訊。";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text,
      groundingMetadata,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};