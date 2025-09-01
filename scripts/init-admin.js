const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://itsalirazzaq:alirazzaq@cluster0.hxxgrva.mongodb.net/'

async function initializeAdmin() {
  let client
  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db()
    const adminCollection = db.collection('admins')
    
    // Check if admin already exists
    const existingAdmin = await adminCollection.findOne({ username: 'AliRazzaq' })
    
    if (existingAdmin) {
      console.log('✅ Default admin already exists!')
      return
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('AliRazzaq97@', salt)
    
    // Create the admin user
    const admin = {
      username: 'AliRazzaq',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await adminCollection.insertOne(admin)
    
    console.log('✅ Default admin created successfully!')
    console.log('Username: AliRazzaq')
    console.log('Password: AliRazzaq97@')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

initializeAdmin()
