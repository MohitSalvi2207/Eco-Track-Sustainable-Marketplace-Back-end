const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { getRecommendations } = require('../utils/recommendations');

// @desc   Get user sustainability stats
// @route  GET /api/analytics/sustainability
exports.getSustainabilityStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get monthly eco impact
        const monthlyImpact = await Order.aggregate([
            { $match: { user: req.user._id, orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    carbonSaved: { $sum: '$ecoImpact.carbonSaved' },
                    plasticReduced: { $sum: '$ecoImpact.plasticReduced' },
                    waterSaved: { $sum: '$ecoImpact.waterSaved' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                ecoScore: user.ecoScore,
                sustainabilityStats: user.sustainabilityStats,
                monthlyImpact
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get seller analytics
// @route  GET /api/analytics/seller
exports.getSellerAnalytics = async (req, res) => {
    try {
        const sellerProducts = await Product.find({ seller: req.user._id });
        const productIds = sellerProducts.map(p => p._id);

        const totalProducts = sellerProducts.length;

        // Revenue and orders for seller's products
        const orderStats = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds }, orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    totalOrders: { $sum: 1 },
                    totalItemsSold: { $sum: '$items.quantity' }
                }
            }
        ]);

        // Monthly revenue
        const monthlyRevenue = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds }, orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        // Top products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds }, orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            analytics: {
                totalProducts,
                totalRevenue: orderStats[0]?.totalRevenue || 0,
                totalOrders: orderStats[0]?.totalOrders || 0,
                totalItemsSold: orderStats[0]?.totalItemsSold || 0,
                monthlyRevenue,
                topProducts
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get AI recommendations
// @route  GET /api/analytics/recommendations
exports.getRecommendedProducts = async (req, res) => {
    try {
        const recommendations = await getRecommendations(req.user._id);
        res.status(200).json({ success: true, products: recommendations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
