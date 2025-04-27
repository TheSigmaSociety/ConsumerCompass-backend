const upcHandler = require("./upchandler");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { GOOGLE_API_KEY } = process.env;

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const systemPrompt = `You are given a JSON object containing basic product information extracted from a barcode. Your task is to analyze the product and return a JSON object with three ratings: sustainability score, nutritional value, price value, and overall rating based on the previous ratings and other factors, such as product quality or reputation. The emphasis of this score should be on sustainability (prioritize sustainability). additionally, output a one sentence brief product description and a VERY BEIEF comment on the ratings given previously (with once again, an emphasis on sustainability).

Based on the product name and brand, evaluate the following attributes:

sustainabilityScore (1-5): How environmentally friendly the product is, considering factors like packaging, sourcing, and production methods.

nutritionalValue (1-5): How healthy the product is for the average consumer.

priceValue (1-5): How good the product is for the price (a product that is unhealthy and expensive at the same time should be given a very low score, and vice versa).

holisticRating (1-5): A general rating of the product based the other ratings and other factors such as quality or reputation.

the additional product description field should just be a brief description of the product, including its features, and comments on the ratings given previously.

Use your general knowledge of the brand and product type to make reasonable judgments.

the response should be a JSON object. a sample response is show below. follow the EXACT same format, but with the values filled in based on the product information provided:

{
    "sustainabilityScore" : 3,
    "priceValue" : 3,
    "nutritionalValue" : 4,
    "holisticRating" : 3,
    "description": "brief description of the product, including its features and comments HERE."
}
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
        throw error;
    }
}

module.exports = {
    getRatings,
    getProductRatings
};