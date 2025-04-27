// endpoint: https://api.upcdatabase.org/product/{id}
require('dotenv').config();
const axios = require("axios");
const UPC_API_KEY = process.env.UPC_API_KEY;

/**
 * Get product information from UPC barcode
 * @param {string} barcodeNumber - The barcode/UPC number to look up
 * @returns {Promise<Object>} - Product information
 */
async function getProductByBarcode(barcodeNumber) {
    // Remove any leading/trailing whitespace from barcode
    const sanitizedBarcode = barcodeNumber.trim();
    const url = `https://api.upcdatabase.org/product/${sanitizedBarcode}`;
    
    console.log(`Making API request to: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${UPC_API_KEY}`
            }
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', JSON.stringify(response.headers));
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.success === "true") {
            // Map the new response format to a compatible format with our existing code
            return mapProductResponse(response.data);
        } else {
            throw new Error(`No product found for barcode: ${sanitizedBarcode}. Response: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("UPC API Error - Response:", {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("UPC API Error - No Response:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("UPC API Error:", error.message);
        }
        throw new Error(`Error fetching product: ${error.message}`);
    }
}

/**
 * Maps the new UPC API response to a format compatible with our existing code
 * @param {Object} product - The product data from the API
 * @returns {Object} - Mapped product information
 */
function mapProductResponse(product) {
    // Create offers array from stores data
    const offers = product.stores ? product.stores.map(store => {
        // Find the URL property (it's a key that starts with "https://")
        const urlKey = Object.keys(store).find(key => 
            typeof key === 'string' && key.startsWith('https://'));
        
        return {
            merchant: store.store,
            price: parseFloat(store.price) || null,
            list_price: parseFloat(store.price) || null,
            link: urlKey || ""
        };
    }) : [];

    // Map to a structure that's compatible with our existing code
    return {
        barcode: product.barcode,
        title: product.title || product.alias || "Unknown",
        description: product.description || "",
        brand: product.brand || "Unknown",
        category: product.category || "",
        images: product.images || [],
        offers: offers,
        // Add additional fields that might be used elsewhere
        manufacturer: product.manufacturer,
        msrp: product.msrp,
        metadata: product.metadata
    };
}

module.exports = {
    getProductByBarcode
};