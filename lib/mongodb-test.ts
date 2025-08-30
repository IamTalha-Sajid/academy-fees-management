/**
 * MongoDB Connection Test
 * Run this to verify MongoDB connection is working
 * 
 * Usage: npx ts-node lib/mongodb-test.ts
 */

import connectToDatabase from './mongodb'
import mongoose from 'mongoose'

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...')
    
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set')
      console.log('📝 Please create .env.local file with:')
      console.log('   MONGODB_URI=mongodb://localhost:27017/academy-fees-management')
      return
    }
    
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI)
    
    // Try to connect
    await connectToDatabase()
    console.log('✅ MongoDB connection successful!')
    
    // Test basic operation
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📂 Available collections:', collections.map(c => c.name))
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure MongoDB is running locally: mongod')
    console.log('2. Check if port 27017 is available')
    console.log('3. Verify MONGODB_URI in .env.local')
    console.log('4. Or use MongoDB Atlas cloud database')
  } finally {
    await mongoose.connection.close()
    console.log('📡 Connection closed')
    process.exit(0)
  }
}

testConnection()