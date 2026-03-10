const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: 2000
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['Clothing', 'Food & Beverages', 'Home & Living', 'Beauty & Personal Care', 'Electronics', 'Accessories', 'Stationery', 'Garden', 'Sports', 'Other']
    },
    images: [{
        type: String
    }],
    ecoRating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 0
    },
    carbonFootprint: {
        type: String,
        enum: ['Very Low', 'Low', 'Medium', 'High'],
        default: 'Medium'
    },
    sustainableMaterials: [{
        type: String
    }],
    certification: [{
        type: String
    }],
    packagingType: {
        type: String,
        enum: ['100% Recyclable', 'Biodegradable', 'Compostable', 'Minimal Packaging', 'Plastic-Free', 'Reusable', 'Standard'],
        default: 'Standard'
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    ecoImpact: {
        carbonSavedPerUnit: { type: Number, default: 0 },
        plasticReducedPerUnit: { type: Number, default: 0 },
        waterSavedPerUnit: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Text index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ ecoRating: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
