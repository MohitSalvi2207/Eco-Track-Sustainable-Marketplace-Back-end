const express = require('express');
const router = express.Router();
const {
    getAllUsers, toggleBlockUser, deleteUser,
    getAllProducts, toggleApproveProduct,
    getAllOrders, getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.use(protect, roleAuth('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.put('/products/:id/approve', toggleApproveProduct);
router.get('/orders', getAllOrders);

module.exports = router;
