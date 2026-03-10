const express = require('express');
const router = express.Router();
const {
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getSellerProducts, getFeaturedProducts, getCategories
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/seller/my-products', protect, roleAuth('seller', 'admin'), getSellerProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, roleAuth('seller', 'admin'), createProduct);
router.put('/:id', protect, roleAuth('seller', 'admin'), updateProduct);
router.delete('/:id', protect, roleAuth('seller', 'admin'), deleteProduct);

module.exports = router;
