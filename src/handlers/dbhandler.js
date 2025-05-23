require("dotenv").config();
const { MONGODB_URI } = process.env;
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoDB client with retry capabilities
const client = new MongoClient(MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000
});

/**
 * Add or update a product in the database based on barcode
 * @param {string} barcode - Product barcode
 * @param {object} productInfo - Basic product info from UPC API
 * @param {object} ratings - Ratings generated by AI
 * @returns {object} - The updated or inserted product
 */
async function addProduct(barcode, productInfo, ratings) {
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');

        const timestamp = Date.now();
        const ratingInstance = {
            timestamp,
            rating: {
                priceValue: ratings.priceValue,
                sustainabilityScore: ratings.sustainabilityScore,
                nutritionalValue: ratings.nutritionalValue,
                holisticRating: ratings.holisticRating,
                description: ratings.description
            }
        };
        
        // Extract the necessary information from the productInfo
        const name = productInfo.title || 'Unknown';
        const brand = productInfo.brand || 'Unknown';
        const image = productInfo.images && productInfo.images.length > 0 
            ? productInfo.images[0] 
            : '';
            
        // Use rawPrice directly from AI ratings response instead of UPC API
        const rawPrice = ratings.rawPrice || null;

        // Try to find existing product
        const existingProduct = await collection.findOne({ barcode });

        let result;
        
        if (existingProduct) {
            // Update existing product
            result = await collection.updateOne(
                { barcode },
                {
                    $set: {
                        mostRecentPriceValue: ratings.priceValue,
                        mostRecentSustainabilityScore: ratings.sustainabilityScore,
                        mostRecentNutritionalValue: ratings.nutritionalValue,
                        mostRecentHolisticRating: ratings.holisticRating,
                        mostRecentDescription: ratings.description,
                        rawPrice: rawPrice // Use AI-provided price
                    },
                    $push: {
                        ratingList: ratingInstance
                    }
                }
            );
            console.log(`Product updated: ${barcode}`);
        } else {
            // Create new product
            const newProduct = {
                barcode,
                name,
                brand,
                image,
                rawPrice, // Use AI-provided price
                mostRecentPriceValue: ratings.priceValue,
                mostRecentSustainabilityScore: ratings.sustainabilityScore,
                mostRecentNutritionalValue: ratings.nutritionalValue,
                mostRecentHolisticRating: ratings.holisticRating,
                mostRecentDescription: ratings.description,
                ratingList: [ratingInstance]
            };
            
            result = await collection.insertOne(newProduct);
            console.log(`New product added: ${barcode}`);
        }
        
        // Return the updated or new document
        return await collection.findOne({ barcode });
    } catch (error) {
        console.error('Error in addProduct:', error);
        throw error;
    } finally {
        // Connection is managed by the MongoClient pool
    }
}

/**
 * Get the top products based on holistic rating
 * @param {number} limit - Number of top products to return
 * @returns {Array} - Array of top-rated products
 */
async function getTopProducts(limit = 4) {
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');
        
        // Find the top products based on holisticRating
        const topProducts = await collection.find({})
            .sort({ mostRecentHolisticRating: -1 })
            .limit(limit)
            .project({
                name: 1,
                brand: 1,
                image: 1,
                rawPrice: 1,
                mostRecentPriceValue: 1,
                mostRecentSustainabilityScore: 1,
                mostRecentNutritionalValue: 1,
                mostRecentHolisticRating: 1,
                mostRecentDescription: 1
            })
            .toArray();
            
        // Format the results to match the required output
        const formattedProducts = topProducts.map(product => ({
            name: product.name,
            brand: product.brand,
            image: product.image,
            rawPrice: product.rawPrice,
            priceValue: product.mostRecentPriceValue,
            sustainabilityScore: product.mostRecentSustainabilityScore,
            nutritionalValue: product.mostRecentNutritionalValue,
            holisticRating: product.mostRecentHolisticRating,
            description: product.mostRecentDescription || ""
        }));
        
        return formattedProducts;
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        throw error;
    } finally {
        // Connection is managed by the MongoClient pool
    }
}

/**
 * Get products by brand name
 * @param {string} brand - Brand name to search for
 * @returns {Array} - Array of products matching the brand
 */
async function getProductsByBrand(brand) {
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');
        
        // Case-insensitive search for brand
        const products = await collection.find({ 
            brand: { $regex: new RegExp(brand, 'i') } 
        })
        .project({
            name: 1,
            barcode: 1
        })
        .toArray();
        
        return products;
    } catch (error) {
        console.error('Error in getProductsByBrand:', error);
        throw error;
    } finally {
        // Connection is managed by the MongoClient pool
    }
}

/**
 * Get detailed product data by barcode
 * @param {string} barcode - Product barcode
 * @returns {object} - Product details including rating history
 */
async function getProductData(barcode) {
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');
        
        // Find product by barcode
        const product = await collection.findOne({ barcode });
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Format response according to requirements
        const response = {
            name: product.name || 'Unknown',
            brand: product.brand || 'Unknown',
            image: product.image || '',
            rawPrice: product.rawPrice || null,
            priceValue: product.mostRecentPriceValue,
            sustainabilityScore: product.mostRecentSustainabilityScore,
            nutritionalValue: product.mostRecentNutritionalValue,
            holisticRating: product.mostRecentHolisticRating,
            description: product.mostRecentDescription || "",
            ratings: product.ratingList || []
        };
        
        return response;
    } catch (error) {
        console.error('Error in getProductData:', error);
        throw error;
    } finally {
        // Connection is managed by the MongoClient pool
    }
}

/**
 * Get a list of all unique brands in the database
 * @returns {Array} - Array of brand names
 */
async function getAllBrands() {
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');
        
        // Instead of using distinct(), use aggregation which is compatible with API Version 1
        const result = await collection.aggregate([
            { $group: { _id: "$brand" } },
            { $match: { _id: { $ne: null } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, brand: "$_id" } }
        ]).toArray();
        
        // Extract brand names from the result
        const brands = result.map(item => item.brand);
        
        return brands;
    } catch (error) {
        console.error('Error in getAllBrands:', error);
        throw error;
    } finally {
        // Connection is managed by the MongoClient pool
    }
}

// Close connection when the app is shutting down
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

module.exports = {
    addProduct,
    getTopProducts,
    getProductsByBrand,
    getProductData,
    getAllBrands
};