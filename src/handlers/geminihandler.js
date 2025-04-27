const upcHandler = require("./upchandler");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { GOOGLE_API_KEY } = process.env;

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const systemPrompt = `You are given a JSON object containing basic product information extracted from a barcode. Your task is to analyze the product and return a JSON object with three ratings: sustainability score, nutritional value, price value, and an overall holistic rating based on the previous ratings and other factors, such as product quality or brand reputation. 

**The emphasis for the holistic rating must prioritize sustainability over all other factors**.

When scoring, you must strictly adhere to the following detailed criteria:

1. **sustainabilityScore (1-5)**:
    - 5 = Product is widely known to be eco-friendly (e.g., organic, minimal packaging, sustainable sourcing).
    - 4 = Product is moderately eco-friendly (some sustainable practices, partially recyclable packaging).
    - 3 = Average; unknown or mixed sustainability practices.
    - 2 = Somewhat unsustainable (excessive packaging, sourcing concerns).
    - 1 = Very harmful to environment (heavy plastic, unethical sourcing).

2. **nutritionalValue (1-5)**:
    - 5 = Very healthy (low sugar, high in nutrients, organic).
    - 4 = Generally healthy (some minor issues like moderate sugar).
    - 3 = Neutral (average food product, not particularly healthy or unhealthy).
    - 2 = Somewhat unhealthy (high sugar, processed, few nutrients).
    - 1 = Very unhealthy (junk food, processed heavily, no nutritional benefit).

3. **priceValue (1-5)**:
    - 5 = Excellent value (high quality relative to price).
    - 4 = Good value (price appropriate for quality).
    - 3 = Average value (price is typical for quality).
    - 2 = Poor value (overpriced for what it offers).
    - 1 = Very poor value (expensive and low quality).

4. **holisticRating (1-5)**:
    - Weighted average of the above three ratings, but **sustainabilityScore counts DOUBLE**. 
    - Formula: `(2 * sustainabilityScore + nutritionalValue + priceValue) / 4`, then round to nearest whole number.

**Additional Output Requirements:**

- **description**: 1 brief sentence summarizing the product and mentioning the ratings given, **emphasizing sustainability first**.
- Always maintain the **EXACT** JSON output structure shown below.
- Always output numeric values as integers (no decimals).

**EXAMPLE OUTPUT (format to strictly follow):**

{
    "sustainabilityScore" : 3,
    "priceValue" : 3,
    "nutritionalValue" : 4,
    "holisticRating" : 3,
    "description": "brief description of the product, including its features and comments HERE."
}

**General Guidelines:**
- If you are unsure about sustainability or nutrition, default to a **3** (neutral).
- Never hallucinate extreme ratings (1 or 5) unless you are confident the product clearly deserves it based on common knowledge.
- Prefer stability and cautious judgments over speculation.

Now, analyze the given product:
`;

async function getRatings(upcResponse) {
    try {
        console.log("UPC Response:", upcResponse);
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                "Here is the product information JSON.",
                JSON.stringify(upcResponse),
            ],
            config: {
                systemInstruction: systemPrompt,
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            },
        });
        
        if (!response || !response.text) {
            throw new Error("Invalid response from Gemini API");
        }
        
        // Clean up response text and parse JSON
        const cleanText = response.text.replace(/```json\s*/, "").replace(/```\s*/, "").trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error getting ratings:", error);
        throw error;
    }
}

// Getting product info and ratings combined in one function
async function getProductRatings(barcodeString) {
    try {
        const productInfo = await upcHandler.getProductByBarcode(barcodeString);
        const ratings = await getRatings(productInfo);
        return {
            productInfo,
            ratings
        };
    } catch (error) {
        console.error("Error in getProductRatings:", error);
        // Add more detailed error information
        if (error.message.includes("No product found for barcode")) {
            throw new Error(`Product not found: ${error.message}`);
        } else if (error.message.includes("Error fetching product")) {
            throw new Error(`API error: ${error.message}`);
        } else {
            throw error;
        }
    }
}

module.exports = {
    getRatings,
    getProductRatings
};