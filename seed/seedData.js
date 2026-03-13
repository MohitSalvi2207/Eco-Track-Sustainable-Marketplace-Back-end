const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

const users = [
    {
        name: 'Admin User',
        email: 'admin@ecotrack.com',
        password: 'admin123',
        role: 'admin',
        ecoScore: 100,
        phone: '+1234567890',
        address: { street: '123 Green St', city: 'Eco City', state: 'CA', zipCode: '90210', country: 'USA' }
    },
    {
        name: 'Green Seller',
        email: 'seller@ecotrack.com',
        password: 'seller123',
        role: 'seller',
        ecoScore: 75,
        phone: '+1987654321',
        address: { street: '456 Nature Ave', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' }
    },
    {
        name: 'Eco Customer',
        email: 'customer@ecotrack.com',
        password: 'customer123',
        role: 'customer',
        ecoScore: 50,
        sustainabilityStats: { carbonSaved: 12, plasticReduced: 5, waterSaved: 30, treesEquivalent: 0.57 },
        phone: '+1122334455',
        address: { street: '789 Earth Blvd', city: 'San Francisco', state: 'CA', zipCode: '94102', country: 'USA' }
    }
];

const getProducts = (sellerId) => [
    // ============================
    // CLOTHING
    // ============================
    {
        name: 'Organic Cotton Classic T-Shirt',
        description: 'Crafted from 100% GOTS-certified organic cotton, this premium tee is grown without toxic pesticides or synthetic fertilizers. Features a relaxed fit, reinforced stitching, and naturally soft hand-feel. Dyed using low-impact, AZO-free dyes. Available in Earth-inspired tones.',
        price: 899,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
        ecoRating: 4.5,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Organic Cotton', 'Natural Dyes'],
        certification: ['GOTS Certified', 'Fair Trade'],
        packagingType: 'Biodegradable',
        stockQuantity: 150,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 2.1, plasticReducedPerUnit: 0.3, waterSavedPerUnit: 5 }
    },
    {
        name: 'Recycled Denim Jacket — Vintage Edition',
        description: 'This iconic jacket is handcrafted from 100% post-consumer recycled denim. Each piece is unique with its own character. Features brass buttons from reclaimed metal, organic cotton lining, and a tailored fit. Saves 7,000 litres of water compared to a new denim jacket.',
        price: 3499,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80'],
        ecoRating: 4.7,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Recycled Denim', 'Reclaimed Metal', 'Organic Cotton'],
        certification: ['Global Recycle Standard', 'Fair Trade'],
        packagingType: 'Biodegradable',
        stockQuantity: 40,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 8.5, plasticReducedPerUnit: 0.5, waterSavedPerUnit: 70 }
    },

    // ============================
    // ACCESSORIES
    // ============================
    {
        name: 'Bamboo Water Bottle — 750ml',
        description: 'Sustainable bamboo exterior with food-grade stainless steel interior. Double-wall vacuum insulated to keep drinks cold for 24 hours and hot for 12 hours. Leak-proof bamboo lid. Replaces 1,000+ single-use plastic bottles.',
        price: 1299,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
        ecoRating: 4.8,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Bamboo', 'Stainless Steel'],
        certification: ['BPA Free', 'FSC Certified'],
        packagingType: '100% Recyclable',
        stockQuantity: 200,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 3.5, plasticReducedPerUnit: 1.5, waterSavedPerUnit: 8 }
    },
    {
        name: 'Hemp Canvas Tote Bag — Large',
        description: 'Oversized tote bag woven from organic hemp and cotton blend canvas. Reinforced double handles with leather-free cork accents. Interior zip pocket and phone sleeve. Replaces 700+ plastic grocery bags.',
        price: 1199,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&q=80'],
        ecoRating: 4.5,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Organic Hemp', 'Organic Cotton', 'Cork'],
        certification: ['GOTS Certified', 'Vegan'],
        packagingType: 'Minimal Packaging',
        stockQuantity: 90,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 3.0, plasticReducedPerUnit: 1.5, waterSavedPerUnit: 5 }
    },
    {
        name: 'Cork & Recycled Leather Wallet',
        description: 'Slim bifold wallet crafted from Portuguese cork and recycled leather. RFID-blocking technology protects your cards. Features 6 card slots, bill compartment, and coin pocket. Lighter than leather, just as durable.',
        price: 1599,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
        ecoRating: 4.3,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Portuguese Cork', 'Recycled Leather'],
        certification: ['Vegan Approved', 'PETA Certified'],
        packagingType: 'Biodegradable',
        stockQuantity: 70,
        seller: sellerId,
        ecoImpact: { carbonSavedPerUnit: 1.8, plasticReducedPerUnit: 0.3, waterSavedPerUnit: 15 }
    },

    // ============================
    // HOME & LIVING
    // ============================
    {
        name: 'Natural Beeswax Food Wraps',
        description: 'Handmade using organic cotton, sustainably sourced beeswax, tree resin, and jojoba oil. Beautiful botanical print designs. Set of 3 (S, M, L). Replaces 300+ meters of plastic wrap over its 1-year lifespan.',
        price: 999,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1611735341450-58dd5d01a364?w=800&q=80'], // This was broken, but I'll update it to a working one if I find it. Actually I'll use a better one.
        images: ['https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80'],
        ecoRating: 4.7,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Beeswax', 'Organic Cotton', 'Jojoba Oil'],
        certification: ['USDA Organic'],
        packagingType: 'Compostable',
        stockQuantity: 150,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 1.8, plasticReducedPerUnit: 0.8, waterSavedPerUnit: 3 }
    },
    {
        name: 'Reusable Silicone Food Storage Set — 12 Pieces',
        description: 'Premium food-grade platinum silicone bags in 4 sizes: snack, sandwich, quart, and gallon. Airtight leak-proof seal, microwave-safe, freezer-safe, dishwasher-safe. Each bag replaces 500+ single-use plastic bags.',
        price: 1899,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1610141160614-55e40f051eeb?w=800&q=80'],
        ecoRating: 4.7,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Platinum Food-Grade Silicone'],
        certification: ['FDA Approved', 'BPA Free', 'LFGB Certified'],
        packagingType: '100% Recyclable',
        stockQuantity: 110,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 2.5, plasticReducedPerUnit: 2.0, waterSavedPerUnit: 5 }
    },

    // ============================
    // FOOD & BEVERAGES
    // ============================
    {
        name: 'Premium Ceremonial Matcha — Uji, Japan',
        description: 'Stone-ground ceremonial grade matcha from 150-year-old tea gardens in Uji, Kyoto. First harvest, shade-grown for 21 days for maximum L-theanine. Rich umami flavor with a vibrant emerald hue. 30g tin in compostable packaging.',
        price: 1499,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80'],
        ecoRating: 4.5,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Organic Tea Leaves'],
        certification: ['USDA Organic', 'JAS Certified'],
        packagingType: 'Compostable',
        stockQuantity: 80,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 0.8, plasticReducedPerUnit: 0.2, waterSavedPerUnit: 2 }
    },
    {
        name: 'Single-Origin Ethiopian Coffee Beans',
        description: 'Hand-picked arabica beans from the Yirgacheffe region of Ethiopia. Shade-grown under native forest canopy at 1,900m altitude. Notes of jasmine, bergamot, and dark chocolate. 250g bag in home-compostable packaging.',
        price: 799,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'],
        ecoRating: 4.6,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Organic Coffee Beans'],
        certification: ['Fair Trade', 'Rainforest Alliance', 'USDA Organic'],
        packagingType: 'Compostable',
        stockQuantity: 130,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 1.3, plasticReducedPerUnit: 0.4, waterSavedPerUnit: 6 }
    },

    // ============================
    // ELECTRONICS
    // ============================
    {
        name: 'Solar Portable Charger — 20000mAh',
        description: 'High-capacity 20,000mAh power bank with dual solar panels. Charges 2 devices simultaneously via USB-C and USB-A. IP67 waterproof, shockproof, and dustproof. Built-in LED flashlight. Perfect for hiking, camping, and emergencies.',
        price: 2499,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80'],
        ecoRating: 4.7,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Recycled ABS Plastic', 'Monocrystalline Solar Cells'],
        certification: ['Energy Star', 'RoHS Compliant'],
        packagingType: '100% Recyclable',
        stockQuantity: 60,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 5.0, plasticReducedPerUnit: 0.1, waterSavedPerUnit: 1 }
    },
    {
        name: 'Bamboo Wireless Keyboard Combo',
        description: 'Elegant wireless keyboard and mouse crafted from natural bamboo. Bluetooth 5.0, rechargeable via USB-C, silent-click keys. Compatible with Mac, PC, and tablets. Natural antimicrobial surface.',
        price: 3299,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
        ecoRating: 4.1,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Natural Bamboo', 'Recycled Aluminum'],
        certification: ['FCC Certified', 'RoHS Compliant'],
        packagingType: '100% Recyclable',
        stockQuantity: 45,
        seller: sellerId,
        ecoImpact: { carbonSavedPerUnit: 2.5, plasticReducedPerUnit: 0.8, waterSavedPerUnit: 5 }
    },

    // ============================
    // BEAUTY & PERSONAL CARE
    // ============================
    {
        name: 'Zero-Waste Shampoo Bar — Coconut & Argan',
        description: 'Solid shampoo bar enriched with organic coconut oil, argan oil, and chamomile extract. Sulfate-free, paraben-free, and plastic-free. One 100g bar equals 3 bottles of liquid shampoo. Suitable for all hair types.',
        price: 499,
        category: 'Beauty & Personal Care',
        images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80'],
        ecoRating: 4.7,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Organic Coconut Oil', 'Argan Oil', 'Chamomile Extract'],
        certification: ['Cruelty Free', 'Vegan', 'Plastic-Free Certified'],
        packagingType: 'Plastic-Free',
        stockQuantity: 250,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 1.2, plasticReducedPerUnit: 0.9, waterSavedPerUnit: 12 }
    },
    {
        name: 'Organic Rose Facial Serum — 30ml',
        description: 'Luxury facial serum with organic rosehip oil, vitamin C, hyaluronic acid, and Damascus rose extract. Cold-pressed and hand-bottled in a violet glass dropper bottle that preserves potency. 100% natural ingredients.',
        price: 1799,
        category: 'Beauty & Personal Care',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'],
        ecoRating: 4.4,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Organic Rosehip Oil', 'Violet Glass', 'Natural Ingredients'],
        certification: ['COSMOS Organic', 'Cruelty Free', 'Vegan'],
        packagingType: 'Reusable',
        stockQuantity: 80,
        seller: sellerId,
        ecoImpact: { carbonSavedPerUnit: 0.5, plasticReducedPerUnit: 0.4, waterSavedPerUnit: 3 }
    },

    // ============================
    // STATIONERY
    // ============================
    {
        name: 'Recycled Paper Notebook Set — 3 Pack',
        description: 'Set of 3 beautiful notebooks (A5) made from 100% post-consumer recycled paper. 80 pages each, 100gsm acid-free paper. Covers printed with soy-based inks. Lay-flat binding. Ruled, dotted, and blank options included.',
        price: 699,
        category: 'Stationery',
        images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80'],
        ecoRating: 4.4,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['100% Recycled Paper', 'Soy Ink'],
        certification: ['FSC Certified', 'Green Seal'],
        packagingType: 'Minimal Packaging',
        stockQuantity: 200,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 1.5, plasticReducedPerUnit: 0.3, waterSavedPerUnit: 6 }
    },

    // ============================
    // GARDEN
    // ============================
    {
        name: 'Solar LED Garden Path Lights — 10 Pack',
        description: 'Elegant stainless steel garden lights powered entirely by solar. Auto on at dusk, off at dawn. Warm white LEDs create beautiful ambiance. IP65 waterproof. No wiring, no electricity costs, no maintenance.',
        price: 1999,
        category: 'Garden',
        images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80'],
        ecoRating: 4.6,
        carbonFootprint: 'Very Low',
        sustainableMaterials: ['Stainless Steel', 'Solar Cells', 'LED'],
        certification: ['Energy Star', 'IP65 Waterproof'],
        packagingType: '100% Recyclable',
        stockQuantity: 70,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 4.0, plasticReducedPerUnit: 0.2, waterSavedPerUnit: 1 }
    },

    // ============================
    // SPORTS
    // ============================
    {
        name: 'Natural Rubber Yoga Mat — 6mm Premium',
        description: 'Professional-grade yoga mat made from sustainably tapped natural tree rubber with an organic cotton surface. Exceptional grip even when wet. Non-toxic, PVC-free, and fully biodegradable at end of life. Comes with a hemp carry strap.',
        price: 2999,
        category: 'Sports',
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'],
        ecoRating: 4.6,
        carbonFootprint: 'Low',
        sustainableMaterials: ['Natural Tree Rubber', 'Organic Cotton', 'Hemp'],
        certification: ['OEKO-TEX', 'Non-Toxic', 'SGS Certified'],
        packagingType: 'Reusable',
        stockQuantity: 60,
        seller: sellerId,
        isFeatured: true,
        ecoImpact: { carbonSavedPerUnit: 2.5, plasticReducedPerUnit: 1.0, waterSavedPerUnit: 8 }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const createdUsers = await User.create(users);
        console.log(`Created ${createdUsers.length} users`);

        const seller = createdUsers.find(u => u.role === 'seller');
        const customer = createdUsers.find(u => u.role === 'customer');

        // Create products
        const products = getProducts(seller._id);
        const createdProducts = await Product.create(products);
        console.log(`Created ${createdProducts.length} products`);

        // Create some sample reviews
        const reviews = [
            { product: createdProducts[0]._id, user: customer._id, rating: 5, comment: 'Amazing quality organic cotton! Super comfortable and great for the environment.' },
            { product: createdProducts[1]._id, user: customer._id, rating: 5, comment: 'This recycled denim jacket is STUNNING. You would never know it is made from recycled materials. The quality is incredible and every piece is unique.' },
            { product: createdProducts[2]._id, user: customer._id, rating: 5, comment: 'Best water bottle I have ever owned. Keeps water cold all day and looks beautiful.' },
            { product: createdProducts[4]._id, user: customer._id, rating: 4, comment: 'Great alternative to plastic wrap. Takes some getting used to but works perfectly.' },
            { product: createdProducts[5]._id, user: customer._id, rating: 5, comment: 'Best matcha I have ever tasted. The color is so vibrant and the flavor is smooth with zero bitterness. The compostable packaging is a great touch.' },
            { product: createdProducts[6]._id, user: customer._id, rating: 4, comment: 'Rich, complex coffee with beautiful floral notes. Love that it is shade-grown and fair trade. My daily morning ritual just got an eco upgrade!' },
            { product: createdProducts[8]._id, user: customer._id, rating: 5, comment: 'Charged my phone during a full day hike using just sunlight. The waterproof design survived a rain storm without any issues. Essential camping gear!' },
            { product: createdProducts[10]._id, user: customer._id, rating: 4, comment: 'My hair feels so clean and healthy. Love that it is zero waste!' },
            { product: createdProducts[15]._id, user: customer._id, rating: 4, comment: 'Incredible yoga mat — the natural rubber provides amazing grip even during hot yoga. Love the hemp carry strap. Worth every rupee.' }
        ].filter(r => r.product); // Filter out any undefined products

        await Review.create(reviews);
        console.log(`Created ${reviews.length} reviews`);

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📧 Demo Accounts:');
        console.log('   Admin:    admin@ecotrack.com / admin123');
        console.log('   Seller:   seller@ecotrack.com / seller123');
        console.log('   Customer: customer@ecotrack.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDB();
