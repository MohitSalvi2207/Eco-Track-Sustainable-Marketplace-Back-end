const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, updateReview, deleteReview, addSellerResponse } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/respond', protect, roleAuth('seller'), addSellerResponse);

module.exports = router;
