
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChartDataItem, SalesForecastInputData, SalesForecastResult, DealStage } from '../types'; // Added SalesForecast types

const API_KEY = process.env.API_KEY;

// Updated CrmData interface to match what SmartInsights will provide
interface SmartInsightsCrmData {
  salesData: ChartDataItem[]; // Monthly revenue or similar
  leadSources: ChartDataItem[]; // Count per source
  dealStats?: {
    totalDeals: number;
    openDeals: number;
    averageDealValue: number;
  };
  // Could add more specific types for customerStats, taskStats if needed
  // customerStats?: any;
  // taskStats?: any;
}

/**
 * Fetches smart insights based on CRM data by calling the Gemini API.
 * Now uses a more structured crmData input.
 */
export const fetchDashboardInsights = async (crmData: SmartInsightsCrmData): Promise<string> => {
  console.log("Attempting to fetch dashboard insights with structured data using Gemini API:", crmData);

  if (!API_KEY) {
    console.error("API_KEY is not available. Please ensure it is set in the environment.");
    throw new Error("API_KEY for Gemini API is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const model = "gemini-2.5-flash-preview-04-17";
    
    let promptContext = "Analyze the following CRM dashboard data and provide 2-3 actionable insights for a sales manager.\nFocus on trends, potential opportunities, or areas needing attention.\nKeep insights concise, easy to understand, and formatted as a multi-line string where each insight is a separate paragraph.\n\n";

    if (crmData.salesData && crmData.salesData.length > 0) {
      promptContext += `Sales Data (e.g., Monthly Revenue): ${JSON.stringify(crmData.salesData)}\n`;
    } else {
      promptContext += "No specific sales data provided for this period.\n";
    }

    if (crmData.leadSources && crmData.leadSources.length > 0) {
      promptContext += `Lead Sources (Count per source): ${JSON.stringify(crmData.leadSources)}\n`;
    } else {
      promptContext += "No lead source data provided.\n";
    }

    if (crmData.dealStats) {
      promptContext += `Deal Statistics: 
        Total Deals: ${crmData.dealStats.totalDeals}, 
        Open Deals: ${crmData.dealStats.openDeals}, 
        Average Deal Value: ${crmData.dealStats.averageDealValue.toFixed(2)}\n`;
    } else {
      promptContext += "No specific deal statistics provided.\n";
    }
    
    promptContext += "\nProvide insights as a multi-line string. For example:\nInsight 1 text...\n\nInsight 2 text...";

    console.log("Sending prompt to Gemini API for insights:", promptContext);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: promptContext,
    });
      
    const text = response.text;
    console.log("Received insights response from Gemini API:", text);

    if (text && text.trim() !== "") {
      return text;
    } else {
      return "No specific insights generated or AI returned an empty response. Consider if the provided data was sufficient for analysis.";
    }
  } catch (error: any) {
    console.error("Error fetching insights from Gemini API:", error);
    let errorMessage = "Failed to communicate with AI for insights.";
    if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    if (error.status) { 
        errorMessage += ` (Status: ${error.status})`;
    }
    if (error.message && error.message.includes('API key not valid')) {
        errorMessage = "The configured API key for Gemini is invalid. Please check your configuration.";
    } else if (error.message && error.message.includes('quota')) {
        errorMessage = "API quota exceeded. Please try again later or check your Gemini API plan.";
    }
    
    throw new Error(errorMessage);
  }
};


/**
 * Fetches a sales forecast from the Gemini API.
 */
export const fetchSalesForecast = async (forecastInput: SalesForecastInputData): Promise<SalesForecastResult> => {
  console.log("Attempting to fetch sales forecast with data:", forecastInput);

  if (!API_KEY) {
    console.error("API_KEY is not available. Please ensure it is set in the environment.");
    throw new Error("API_KEY for Gemini API is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  // Simulate API call latency
  // await new Promise(resolve => setTimeout(resolve, 700));

  try {
    const model = "gemini-2.5-flash-preview-04-17"; // Correct model name

    let prompt = `You are an expert sales forecasting AI. Based on the following CRM data, provide a sales forecast for ${forecastInput.forecastPeriod}.
Data:
- Historical Won Deals (summary of last 6-12 months): ${JSON.stringify(forecastInput.historicalWonDeals.slice(0,20))} (showing up to 20 for brevity)
- Current Open Deals (value, stage, expected close date): ${JSON.stringify(forecastInput.openDeals.slice(0,20))} (showing up to 20 for brevity)
- Recent Lead Generation (new leads in the last 30 days): ${forecastInput.recentLeadVolume}

Please provide the forecast in the following format:
Forecasted Revenue: [Estimated range, e.g., $X,XXX - $Y,YYY USD] for ${forecastInput.forecastPeriod}.
Confidence Level: [e.g., High, Medium, Low]
Key Factors:
- [Factor 1 influencing the forecast]
- [Factor 2 influencing the forecast]
- [Any potential risks or opportunities]

Keep the language professional and concise. The output should be plain text.
`;

    console.log("Sending prompt to Gemini API for sales forecast:", prompt);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    console.log("Received sales forecast response from Gemini API:", text);

    if (text && text.trim() !== "") {
      return { forecastText: text };
    } else {
      return { forecastText: "AI returned no specific forecast. The data might have been insufficient or an unexpected response occurred." };
    }
  } catch (error: any) {
    console.error("Error fetching sales forecast from Gemini API:", error);
    let errorMessage = "Failed to communicate with AI for sales forecast.";
     if (error.message) {
        errorMessage += ` Details: ${error.message}`;
    }
    if (error.status) { 
        errorMessage += ` (Status: ${error.status})`;
    }
    if (error.message && error.message.includes('API key not valid')) {
        errorMessage = "The configured API key for Gemini is invalid. Please check your configuration.";
    } else if (error.message && error.message.includes('quota')) {
        errorMessage = "API quota exceeded. Please try again later or check your Gemini API plan.";
    }
    throw new Error(errorMessage);
  }
};
