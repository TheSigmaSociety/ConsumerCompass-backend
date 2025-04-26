const upcHandler = require("./upchandler");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { GOOGLE_API_KEY } = process.env;

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const systemPrompt = `You are given a JSON object containing basic product information extracted from a barcode. Your task is to analyze the product and return a JSON object with four ratings: prpice value, sustainability, nutritional value, and overall rating based on the previous ratings and other factors, such as product quality or reputation. additiioinally, output a one sentence brief product description and a VERY BEIEF comment on the ratings given previously.

Based on the product name and brand, evaluate the following attributes:

priceValue (1-5): How good the product is for the price.

sustainabilityRating (1-5): How environmentally friendly the product or brand is.

nutritionalValue (1-5): How healthy the product is for the average consumer.

holisticRating (1-5): A general rating of the product based the other ratings and other factors such as quality or reputation.

the additional product description field should just be a brief description of the product, including its features, and comments on the ratings given previously.

Use your general knowledge of the brand and product type to make reasonable judgments.

the response should be a JSON object. a sample response is show below. follow the EXACT same format, but with the values filled in based on the product information provided:

{
    "priceValue" : 3
    "sustainabilityScore" : 3,
    "nutritionalValue" : 4,
    "holisticRating" : 3,
    "description": "brief description of the product, including its features and comments HERE."
}
`;

async function getRatings(upcResponse) {
    console.log("UPC Response:", upcResponse);
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            "Here is the product information JSON.",
            JSON.stringify(upcResponse),
        ],
        config: {
            systemInstruction:
                systemPrompt,
            tools: [{ googleSearch: {} }],
            temperature: 0.1,
        },
    });
    
    return JSON.parse(response.text.replace(/```json/, "").replace(/```/, "").trim());
}