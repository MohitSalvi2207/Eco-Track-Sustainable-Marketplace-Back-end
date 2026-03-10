const User = require('../models/User');

// @desc   Add to wishlist
// @route  POST /api/wishlist/:productId
exports.addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.productId;

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        const updated = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({ success: true, wishlist: updated.wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Remove from wishlist
// @route  DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();

        const updated = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({ success: true, wishlist: updated.wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get wishlist
// @route  GET /api/wishlist
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
