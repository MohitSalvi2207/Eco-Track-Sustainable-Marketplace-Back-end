const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoURI) {
            console.error('❌ MongoDB URI is not defined!');
            console.error('   Set MONGODB_URI in your .env file (local) or environment variables (deployment).');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
