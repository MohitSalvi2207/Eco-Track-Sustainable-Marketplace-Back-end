const express = require('express');
const router = express.Router();
const { getSustainabilityStats, getSellerAnalytics, getRecommendedProducts } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.get('/sustainability', protect, getSustainabilityStats);
router.get('/seller', protect, roleAuth('seller', 'admin'), getSellerAnalytics);
router.get('/recommendations', protect, getRecommendedProducts);

module.exports = router;
