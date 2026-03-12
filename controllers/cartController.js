const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateOrderImpact } = require('../utils/ecoCalculator');

// @desc   Get user cart
// @route  GET /api/cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = { items: [] };
        }

        // Calculate eco impact
        const itemsWithProducts = cart.items?.filter(item => item.product) || [];
        const ecoImpact = calculateOrderImpact(
            itemsWithProducts.map(item => ({
                product: item.product,
                quantity: item.quantity
            }))
        );

        // Calculate totals
        const subtotal = itemsWithProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        res.status(200).json({
            success: true,
            cart: cart.items || [],
            subtotal: Math.round(subtotal * 100) / 100,
            ecoImpact
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Add item to cart
// @route  POST /api/cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.status(200).json({ success: true, cart: cart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Add multiple items to cart
// @route  POST /api/cart/bulk
exports.addMultipleToCart = async (req, res) => {
    try {
        const { productIds } = req.body; // Expecting an array of product IDs

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of product IDs' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Fetch products to verify stock
        const products = await Product.find({ _id: { $in: productIds } });
        
        const validProducts = products.filter(p => p.stockQuantity >= 1);
        let addedCount = 0;

        validProducts.forEach(product => {
            const existingItem = cart.items.find(item => item.product.toString() === product._id.toString());
            if (existingItem) {
                // If adding all products displayed, we increment by 1
                existingItem.quantity += 1;
            } else {
                cart.items.push({ product: product._id, quantity: 1 });
            }
            addedCount++;
        });

        await cart.save();
        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.status(200).json({ 
            success: true, 
            cart: cart.items, 
            message: `Successfully added ${addedCount} product(s) to your cart.` 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update cart item quantity
// @route  PUT /api/cart/:productId
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.product.toString() === req.params.productId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.status(200).json({ success: true, cart: updatedCart.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        res.status(200).json({ success: true, cart: updatedCart?.items || [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Clear cart
// @route  DELETE /api/cart
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
