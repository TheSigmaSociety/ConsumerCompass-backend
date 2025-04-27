// endpoint: https://world.openfoodfacts.org/api/v0/product/{id}.json
require('dotenv').config();
const axios = require("axios");

/**
 * Get product information from UPC barcode
 * @param {string} barcodeNumber - The barcode/UPC number to look up
 * @returns {Promise<Object>} - Product information
 */
async function getProductByBarcode(barcodeNumber) {
    // Remove any leading/trailing whitespace from barcode
    const sanitizedBarcode = barcodeNumber.trim();
    const url = `https://world.openfoodfacts.org/api/v0/product/${sanitizedBarcode}.json`;
    
    console.log(`Making API request to: ${url}`);

    try {
        const response = await axios.get(url);

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', JSON.stringify(response.headers));
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.status === 1) {
            // Map the Open Food Facts response format to a compatible format with our existing code
            return mapProductResponse(response.data);
        } else {
            throw new Error(`No product found for barcode: ${sanitizedBarcode}. Response: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Open Food Facts API Error - Response:", {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Open Food Facts API Error - No Response:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Open Food Facts API Error:", error.message);
        }
        throw new Error(`Error fetching product: ${error.message}`);
    }
}

/**
 * Maps the Open Food Facts API response to a format compatible with our existing code
 * @param {Object} response - The response data from the API
 * @returns {Object} - Mapped product information
 */
function mapProductResponse(response) {
    const product = response.product;
    
    // Get the first image URL if available
    const imageUrl = product.image_url || 
                    (product.selected_images && product.selected_images.front && 
                     product.selected_images.front.display && 
                     product.selected_images.front.display.en) || 
                    "";
    
    // Collect all available images
    const images = [];
    if (imageUrl) {
        images.push(imageUrl);
    }
    
    // Add other image URLs if available
    if (product.image_front_url) images.push(product.image_front_url);
    if (product.image_ingredients_url) images.push(product.image_ingredients_url);
    if (product.image_nutrition_url) images.push(product.image_nutrition_url);
    
    // Extract price and store information (not provided by Open Food Facts)
    // Create a placeholder for offers to maintain compatibility
    const offers = [];
    
    // Map to a structure that's compatible with our existing code
    return {
        barcode: response.code || product._id,
        title: product.product_name || product.generic_name || "Unknown",
        description: product.generic_name || "",
        brand: product.brands || "Unknown",
        category: product.categories || "",
        images: images,
        offers: offers,
        // Add additional fields that might be used elsewhere
        manufacturer: product.brands,
        msrp: null,
        metadata: {
            nutrition_grades: product.nutrition_grades || "",
            ecoscore_grade: product.ecoscore_grade || "",
            nova_group: product.nova_group || "",
            ingredients_text: product.ingredients_text || "",
            nutriments: product.nutriments || {},
            additives_tags: product.additives_tags || []
        }
    };
}

module.exports = {
    getProductByBarcode
};