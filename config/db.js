const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoURI) {
            console.warn('⚠️  MongoDB URI is not defined. Server running without database.');
            console.warn('   Set MONGODB_URI in environment variables to enable database features.');
            return;
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('   Server will continue running without database connection.');
    }
};

module.exports = connectDB;
