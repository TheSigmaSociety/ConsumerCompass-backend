require("dotenv").config();
const { MONGODB_URI } = process.env;
const { MongoClient } = require('mongodb');

async function addProduct(priceRating, sustainabilityRating, nutritionalValue, holisticRating, description) {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');

        const productDocument = {
            "priceRating": priceRating,
            "sustainabilityRating": sustainabilityRating,
            "nutritionalValue": nutritionalValue,
            "holisticRating": holisticRating,
            "description": description
        };

        // Insert the document into the specified collection        
        const p = await collection.insertOne(productDocument);
        console.log("Product added:\n" + JSON.stringify(productDocument));
    } finally {
        await client.close();
    }
}

async function topProducts() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('EntriesDB');
        const collection = db.collection('EntriesCo');
        // Find the top 3 products based on holisticRating
        const topProducts = await collection.find({}).sort({ holisticRating: -1 }).limit(3).toArray();
        console.log("Top Products:\n" + JSON.stringify(topProducts));
    } finally {
        await client.close();
    }
}