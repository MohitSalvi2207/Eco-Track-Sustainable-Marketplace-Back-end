const express = require('express');
const router = express.Router();
const {
    createOrder, getMyOrders, getOrder, cancelOrder, updateOrderStatus, getSellerOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/seller', protect, roleAuth('seller', 'admin'), getSellerOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, roleAuth('seller', 'admin'), updateOrderStatus);

module.exports = router;
