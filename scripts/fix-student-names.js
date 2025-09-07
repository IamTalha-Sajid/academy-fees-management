const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    return envVars
  }
  return {}
}

const envVars = loadEnvFile()

// Function to convert name to proper case
function toProperCase(name) {
  if (!name || typeof name !== 'string') return name
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function fixStudentNames() {
  const mongoUri = envVars.MONGODB_URI || process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in .env.local or environment variables')
    console.log('Please make sure your .env.local file contains: MONGODB_URI=your_mongodb_connection_string')
    return
  }
  
  const client = new MongoClient(mongoUri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const studentsCollection = db.collection('students')
    
    // Get all students
    const students = await studentsCollection.find({}).toArray()
    console.log(`Found ${students.length} students to process`)
    
    let updatedCount = 0
    
    for (const student of students) {
      const originalName = student.name
      const properCaseName = toProperCase(originalName)
      
      // Only update if the name actually changed
      if (originalName !== properCaseName) {
        await studentsCollection.updateOne(
          { _id: student._id },
          { $set: { name: properCaseName } }
        )
        
        console.log(`Updated: "${originalName}" → "${properCaseName}"`)
        updatedCount++
      } else {
        console.log(`No change needed: "${originalName}"`)
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} student names`)
    console.log(`📊 Total students processed: ${students.length}`)
    
  } catch (error) {
    console.error('❌ Error fixing student names:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
fixStudentNames()