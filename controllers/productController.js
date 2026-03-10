const Product = require('../models/Product');

// @desc   Get all products with search, filter, sort, pagination
// @route  GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, minEcoRating, carbonFootprint, packagingType, sort, page = 1, limit = 12 } = req.query;

        const query = { isApproved: true };

        // Text search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filters
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (minEcoRating) query.ecoRating = { $gte: Number(minEcoRating) };
        if (carbonFootprint) query.carbonFootprint = carbonFootprint;
        if (packagingType) query.packagingType = packagingType;

        // Sort options
        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'eco_rating') sortObj = { ecoRating: -1 };
        else if (sort === 'rating') sortObj = { averageRating: -1 };
        else if (sort === 'newest') sortObj = { createdAt: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit))
            .populate('seller', 'name');

        res.status(200).json({
            success: true,
            products,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get single product
// @route  GET /api/products/:id
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name email');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Create product (Seller)
// @route  POST /api/products
exports.createProduct = async (req, res) => {
    try {
        req.body.seller = req.user._id;
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update product (Seller)
// @route  PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete product (Seller/Admin)
// @route  DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get seller products
// @route  GET /api/products/seller/my-products
exports.getSellerProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get featured products
// @route  GET /api/products/featured
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isApproved: true, isFeatured: true })
            .sort({ ecoRating: -1 })
            .limit(8)
            .populate('seller', 'name');
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get product categories
// @route  GET /api/products/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
