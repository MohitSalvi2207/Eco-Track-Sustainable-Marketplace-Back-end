const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

const categories = ['Clothing', 'Food & Beverages', 'Home & Living', 'Beauty & Personal Care', 'Electronics', 'Accessories', 'Stationery', 'Garden', 'Sports'];

const adjectives = ['Organic', 'Eco-Friendly', 'Sustainable', 'Recycled', 'Biodegradable', 'Natural', 'Handmade', 'Premium', 'Earth-Friendly', 'Ethical', 'Zero-Waste', 'Green'];
const productTypes = {
  'Clothing': ['T-Shirt', 'Jacket', 'Jeans', 'Socks', 'Sweater', 'Dress', 'Scarf', 'Cap'],
  'Food & Beverages': ['Matcha', 'Coffee Beans', 'Herbal Tea', 'Organic Honey', 'Energy Bar', 'Spice Blend', 'Coconut Water', 'Dark Chocolate'],
  'Home & Living': ['Beeswax Wrap', 'Bamboo Sheets', 'Soy Candle', 'Wool Rug', 'Glass Jar', 'Recycled Vase', 'Linen Towel', 'Cork Coaster'],
  'Beauty & Personal Care': ['Shampoo Bar', 'Face Serum', 'Bamboo Toothbrush', 'Soap Nut', 'Body Butter', 'Loofah', 'Lip Balm', 'Clay Mask'],
  'Electronics': ['Solar Charger', 'Bamboo Keyboard', 'Wooden Mouse', 'Recycled Speakers', 'Solar Lantern', 'Eco-Friendly Phone Case', 'Eco Power Strip'],
  'Accessories': ['Tote Bag', 'Cork Wallet', 'Bamboo Sunglasses', 'Recycled Watch', 'Hemp Belt', 'Upcycled Keychain', 'Canvas Backpack'],
  'Stationery': ['Recycled Notebook', 'Plantable Pencil', 'Hemp Paper', 'Soy Ink Pen', 'Cork Desk Mat', 'Recycled Planner'],
  'Garden': ['Solar Garden Light', 'Organic Seeds', 'Compost Bin', 'Bamboo Planter', 'Biodegradable Pot', 'Hemp Garden Gloves'],
  'Sports': ['Yoga Mat', 'Organic Cotton Towel', 'Bamboo Water Bottle', 'Hemp Gym Bag', 'Eco-Friendly Yoga Block', 'Natural Rubber Resistance Band']
};

const materials = {
  'Clothing': ['Organic Cotton', 'Recycled Denim', 'Hemp', 'Linen', 'Tencel'],
  'Food & Beverages': ['Organic', 'Direct Trade', 'Non-GMO', 'Wild-harvested'],
  'Home & Living': ['Bamboo', 'Soy Wax', 'Beeswax', 'Recycled Glass', 'Organic Wool'],
  'Beauty & Personal Care': ['Essential Oils', 'Organic Coconut Oil', 'Argan Oil', 'Shea Butter'],
  'Electronics': ['Recycled ABS', 'Bamboo', 'Bio-Plastic', 'Solar Cells'],
  'Accessories': ['Cork', 'Recycled Leather', 'Hemp Canvas', 'Upcycled Fabrics'],
  'Stationery': ['Post-Consumer Paper', 'Seed Paper', 'Recycled Cardboard'],
  'Garden': ['Stainless Steel', 'Recycled Wood', 'Coconut Coir', 'Bamboo'],
  'Sports': ['Natural Rubber', 'Cork', 'Recycled PET', 'Hemp']
};

const images = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  'https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=800&q=80',
  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
  'https://images.unsplash.com/photo-1611735341450-58dd5d01a364?w=800&q=80',
  'https://images.unsplash.com/photo-1610141160614-55e40f051eeb?w=800&q=80',
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
  'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80',
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
  'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=800&q=80',
  'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=800&q=80'
];

const generateProducts = (sellerId) => {
  const products = [];
  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const type = productTypes[category][Math.floor(Math.random() * productTypes[category].length)];
    const materialArr = materials[category];
    const selectedMaterials = [materialArr[Math.floor(Math.random() * materialArr.length)]];
    if (Math.random() > 0.5) selectedMaterials.push(materialArr[Math.floor(Math.random() * materialArr.length)]);

    const price = Math.floor(Math.random() * 5000) + 199;
    const ecoRating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
    
    products.push({
      name: `${adjective} ${type}`,
      description: `A high-quality, ${adjective.toLowerCase()} ${type.toLowerCase()} designed for a sustainable lifestyle. Made with ${selectedMaterials.join(' and ')}, this product is part of our commitment to reducing environmental impact. Durable, ethical, and beautiful.`,
      price: price,
      category: category,
      images: [images[Math.floor(Math.random() * images.length)]],
      ecoRating: parseFloat(ecoRating),
      carbonFootprint: ['Very Low', 'Low', 'Medium'][Math.floor(Math.random() * 3)],
      sustainableMaterials: Array.from(new Set(selectedMaterials)),
      certification: ['Fair Trade', 'Eco-Certified', 'Global Recycled Standard'].slice(0, Math.floor(Math.random() * 3) + 1),
      packagingType: ['100% Recyclable', 'Biodegradable', 'Compostable', 'Plastic-Free'][Math.floor(Math.random() * 4)],
      stockQuantity: Math.floor(Math.random() * 200) + 10,
      seller: sellerId,
      isFeatured: Math.random() > 0.8,
      ecoImpact: {
        carbonSavedPerUnit: (Math.random() * 5).toFixed(1),
        plasticReducedPerUnit: (Math.random() * 2).toFixed(1),
        waterSavedPerUnit: Math.floor(Math.random() * 50)
      }
    });
  }
  return products;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Get the seller user (create one if doesn't exist)
    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      const hashedPassword = await bcrypt.hash('seller123', 10);
      seller = await User.create({
        name: 'Green Seller',
        email: 'seller@ecotrack.com',
        password: hashedPassword,
        role: 'seller',
        ecoScore: 75,
        phone: '+1987654321',
        address: { street: '456 Nature Ave', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' }
      });
      console.log('Created a demo seller user');
    }

    // Clear existing products and reviews
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing products and reviews');

    // Generate and insert 100 products
    const productsData = generateProducts(seller._id);
    const createdProducts = await Product.create(productsData);
    console.log(`Successfully seeded ${createdProducts.length} products to Atlas!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
