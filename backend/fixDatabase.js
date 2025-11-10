// fixDatabase.js
import mongoose from "mongoose";
import { MONGO_URL } from "./config.js";

async function fixDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to database');

    const collection = mongoose.connection.db.collection('hotels');
    
    // Remove the problematic index
    try {
      await collection.dropIndex('id_1');
      console.log('✅ Removed id_1 index');
    } catch (error) {
      console.log('ℹ️ Index already removed or not found');
    }
    
    console.log('🎉 Database fixed! You can now add multiple hotels.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDatabase();