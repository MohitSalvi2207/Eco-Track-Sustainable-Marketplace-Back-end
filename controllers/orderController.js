const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { calculateOrderImpact } = require('../utils/ecoCalculator');

// @desc   Create new order
// @route  POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check stock and build order items
        const orderItems = [];
        for (const item of cart.items) {
            if (!item.product) continue;
            if (item.product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `${item.product.name} is out of stock` });
            }
            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                image: item.product.images[0] || '',
                quantity: item.quantity,
                price: item.product.price
            });
        }

        const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingPrice = totalPrice > 500 ? 0 : 50;
        const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;

        // Calculate eco impact
        const ecoImpact = calculateOrderImpact(
            cart.items.map(item => ({ product: item.product, quantity: item.quantity }))
        );

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            totalPrice: totalPrice + shippingPrice + taxPrice,
            shippingPrice,
            taxPrice,
            ecoImpact,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        // Update stock
        for (const item of cart.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product._id, {
                    $inc: { stockQuantity: -item.quantity }
                });
            }
        }

        // Update user eco stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                ecoScore: ecoImpact.ecoScoreEarned,
                'sustainabilityStats.carbonSaved': ecoImpact.carbonSaved,
                'sustainabilityStats.plasticReduced': ecoImpact.plasticReduced,
                'sustainabilityStats.waterSaved': ecoImpact.waterSaved,
                'sustainabilityStats.treesEquivalent': ecoImpact.treesEquivalent
            }
        });

        // Clear cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get user orders
// @route  GET /api/orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images ecoRating');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get single order
// @route  GET /api/orders/:id
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name images ecoRating price')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Cancel order
// @route  PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({ message: `Cannot cancel order with status: ${order.orderStatus}` });
        }

        order.orderStatus = 'Cancelled';
        order.cancelledAt = Date.now();
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: item.quantity }
            });
        }

        // Reverse eco stats
        await User.findByIdAndUpdate(order.user, {
            $inc: {
                ecoScore: -order.ecoImpact.ecoScoreEarned,
                'sustainabilityStats.carbonSaved': -order.ecoImpact.carbonSaved,
                'sustainabilityStats.plasticReduced': -order.ecoImpact.plasticReduced,
                'sustainabilityStats.waterSaved': -order.ecoImpact.waterSaved,
                'sustainabilityStats.treesEquivalent': -(order.ecoImpact.carbonSaved / 21)
            }
        });

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update order status (Admin/Seller)
// @route  PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = status;
        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentStatus = 'paid';
        }
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get seller orders
// @route  GET /api/orders/seller
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        const orders = await Order.find({
            'items.product': { $in: productIds }
        })
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('items.product', 'name images price');

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
