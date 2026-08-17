const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/helperhub';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Local MongoDB (${uri}) not reachable: ${error.message}`);
    console.log('🔄 Launching In-Memory MongoDB instance for development & testing...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB connected at ${memoryUri}`);

      // Auto-seed initial demo dataset if collections are empty
      try {
        const { autoSeed } = require('../utils/seedData');
        if (typeof autoSeed === 'function') {
          await autoSeed();
        }
      } catch (seedErr) {
        console.warn('⚠️ Note: Auto-seed skipped:', seedErr.message);
      }

      return conn;
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB fallback:', memErr.message);
      throw memErr;
    }
  }
};

module.exports = connectDB;
