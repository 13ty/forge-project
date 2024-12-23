const mongoose = require('mongoose');
  require('dotenv').config();

  class DatabaseConnection {
    constructor() {
      this.connection = null;
    }

    async connect() {
      try {
        this.connection = await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });

        console.log('⚓ Database connection established');
        return this.connection;
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
      }
    }

    async disconnect() {
      if (this.connection) {
        await mongoose.connection.close();
        console.log('🚢 Database connection closed');
      }
    }

    // Utility method to clear database (useful for testing)
    async clearDatabase() {
      const collections = mongoose.connection.collections;
      
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      
      console.log('🧹 Database cleared');
    }
  }

  module.exports = new DatabaseConnection();
