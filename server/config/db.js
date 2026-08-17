const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.warn(`💡 Tip: Make sure MongoDB is running locally at ${process.env.MONGO_URI} or provide a MONGO_URI in server/.env (e.g. MongoDB Atlas cluster link).`);
  }
};

module.exports = connectDB;
