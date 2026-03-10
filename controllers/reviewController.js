const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc   Get product reviews
// @route  GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Create review
// @route  POST /api/reviews/:productId
exports.createReview = async (req, res) => {
    try {
        const { rating, comment, images } = req.body;
        const productId = req.params.productId;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check existing review
        const existingReview = await Review.findOne({ product: productId, user: req.user._id });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            comment,
            images: images || []
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'name profilePhoto');
        res.status(201).json({ success: true, review: populatedReview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update review
// @route  PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rating, comment, images } = req.body;
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.images = images || review.images;
        await review.save();

        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete review
// @route  DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(req.params.id);

        // Recalculate average
        await Review.calculateAverageRating(productId);

        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Add seller response
// @route  PUT /api/reviews/:id/respond
exports.addSellerResponse = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('product');
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the seller of this product
        if (review.product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        review.sellerResponse = req.body.response;
        await review.save();

        res.status(200).json({ success: true, review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
