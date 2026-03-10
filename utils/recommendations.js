const Product = require('../models/Product');

/**
 * AI Smart Recommendations
 * Content-based filtering using eco preferences and category matching
 */

const getRecommendations = async (userId, limit = 8) => {
    try {
        const Order = require('../models/Order');
        const userOrders = await Order.find({ user: userId }).populate('items.product');

        // Get categories and eco preferences from purchase history
        const categoryCount = {};
        let avgEcoRating = 0;
        let totalProducts = 0;

        userOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    const cat = item.product.category;
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                    avgEcoRating += item.product.ecoRating;
                    totalProducts++;
                }
            });
        });

        if (totalProducts > 0) {
            avgEcoRating = avgEcoRating / totalProducts;
        } else {
            avgEcoRating = 3;
        }

        // Sort categories by frequency
        const preferredCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .map(([cat]) => cat);

        // Build recommendation query
        const query = {
            isApproved: true,
            stockQuantity: { $gt: 0 },
            ecoRating: { $gte: Math.max(avgEcoRating - 1, 0) }
        };

        if (preferredCategories.length > 0) {
            query.category = { $in: preferredCategories.slice(0, 3) };
        }

        // Get already purchased product IDs
        const purchasedIds = [];
        userOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) purchasedIds.push(item.product._id);
            });
        });

        if (purchasedIds.length > 0) {
            query._id = { $nin: purchasedIds };
        }

        let recommendations = await Product.find(query)
            .sort({ ecoRating: -1, averageRating: -1 })
            .limit(limit)
            .populate('seller', 'name');

        // If not enough recommendations, fill with top eco products
        if (recommendations.length < limit) {
            const remaining = limit - recommendations.length;
            const existingIds = recommendations.map(r => r._id);
            const fallback = await Product.find({
                isApproved: true,
                stockQuantity: { $gt: 0 },
                _id: { $nin: [...purchasedIds, ...existingIds] }
            })
                .sort({ ecoRating: -1, averageRating: -1 })
                .limit(remaining)
                .populate('seller', 'name');
            recommendations = [...recommendations, ...fallback];
        }

        return recommendations;
    } catch (error) {
        // Fallback: return top eco-rated products
        return await Product.find({ isApproved: true, stockQuantity: { $gt: 0 } })
            .sort({ ecoRating: -1 })
            .limit(limit)
            .populate('seller', 'name');
    }
};

module.exports = { getRecommendations };
