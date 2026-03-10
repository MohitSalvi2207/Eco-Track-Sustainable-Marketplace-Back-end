const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc   Get all users (Admin)
// @route  GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Block/Unblock user
// @route  PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot block admin users' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete user (Admin)
// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all products (Admin)
// @route  GET /api/admin/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Approve/Unapprove product
// @route  PUT /api/admin/products/:id/approve
exports.toggleApproveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isApproved = !product.isApproved;
        await product.save();

        res.status(200).json({
            success: true,
            message: `Product ${product.isApproved ? 'approved' : 'unapproved'}`,
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all orders (Admin)
// @route  GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get dashboard stats (Admin)
// @route  GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Eco impact totals
        const ecoResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalCarbonSaved: { $sum: '$ecoImpact.carbonSaved' },
                    totalPlasticReduced: { $sum: '$ecoImpact.plasticReduced' },
                    totalWaterSaved: { $sum: '$ecoImpact.waterSaved' }
                }
            }
        ]);

        // Monthly orders for chart
        const monthlyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        // Role distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                ecoImpact: ecoResult[0] || { totalCarbonSaved: 0, totalPlasticReduced: 0, totalWaterSaved: 0 },
                monthlyOrders,
                roleDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
