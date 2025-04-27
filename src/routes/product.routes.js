const express = require('express');
const router = express.Router();
const dbHandler = require('../handlers/dbhandler');
const geminiHandler = require('../handlers/geminihandler');
const { asyncHandler } = require('../utils/helpers');

/**
 * @route   POST /api/addProduct
 * @desc    Process a barcode to get product info and AI ratings, then store in DB
 * @access  Public
 */
router.post('/addProduct', asyncHandler(async (req, res) => {
    const { barcode } = req.body;
    
    if (!barcode) {
        return res.status(400).json({ 
            success: false, 
            error: 'Barcode is required' 
        });
    }
    
    const { productInfo, ratings } = await geminiHandler.getProductRatings(barcode);
    
    const imageUrl = productInfo.images && productInfo.images.length > 0 
        ? productInfo.images[0] 
        : '';
    const name = productInfo.title || 'Unknown';
    const brand = productInfo.brand || 'Unknown';
    
    const price = ratings.rawPrice || null;
    
    await dbHandler.addProduct(barcode, productInfo, ratings);
    
    res.status(200).json({
        success: true,
        data: {
            ...ratings,
            name,
            brand,
            price, // Using AI-generated price
            image: imageUrl,
            nutritionGrade: productInfo.metadata?.nutrition_grades,
            novaGroup: productInfo.metadata?.nova_group
        }
    });
}));

/**
 * @route   GET /api/topProducts
 * @desc    Get top 4 highest rated products based on holistic rating
 * @access  Public
 */
router.get('/topProducts', asyncHandler(async (req, res) => {
    const topProducts = await dbHandler.getTopProducts(4);
    
    res.status(200).json({
        success: true,
        list: topProducts
    });
}));

/**
 * @route   GET /api/getProducts/:brand
 * @desc    Get products by brand name
 * @access  Public
 */
router.get('/getProducts/:brand', asyncHandler(async (req, res) => {
    const { brand } = req.params;
    
    if (!brand) {
        return res.status(400).json({
            success: false,
            error: 'Brand name is required'
        });
    }
    
    const products = await dbHandler.getProductsByBrand(brand);
    
    res.status(200).json({
        success: true,
        list: products
    });
}));

/**
 * @route   GET /api/getData/:barcodeString
 * @desc    Get detailed product data by barcode including rating history
 * @access  Public
 */
router.get('/getData/:barcodeString', asyncHandler(async (req, res) => {
    const { barcodeString } = req.params;
    
    if (!barcodeString) {
        return res.status(400).json({
            success: false,
            error: 'Barcode is required'
        });
    }
    
    const productData = await dbHandler.getProductData(barcodeString);
    
    res.status(200).json({
        success: true,
        data: productData
    });
}));

/**
 * @route   GET /api/brands
 * @desc    Get a list of all unique brands in the database
 * @access  Public
 */
router.get('/brands', asyncHandler(async (req, res) => {
    const brands = await dbHandler.getAllBrands();
    
    res.status(200).json({
        success: true,
        count: brands.length,
        brands: brands
    });
}));

module.exports = router;