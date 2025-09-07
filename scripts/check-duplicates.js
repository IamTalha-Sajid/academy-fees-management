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

// Function to normalize data for comparison
function normalizeForComparison(data) {
  return {
    name: data.name?.toLowerCase().trim() || '',
    contact: data.contact?.replace(/\D/g, '') || '', // Remove non-digits
    email: data.email?.toLowerCase().trim() || '',
    batch: data.batch?.toLowerCase().trim() || ''
  }
}

// Function to check for duplicates
function findDuplicates(students) {
  const duplicates = []
  const seen = new Map()
  
  students.forEach((student, index) => {
    const normalized = normalizeForComparison(student)
    
    // Create a unique key based on name and batch (more relevant for academy management)
    const key = `${normalized.name}|${normalized.batch}`
    
    if (seen.has(key)) {
      // Found a duplicate
      const originalIndex = seen.get(key)
      const originalStudent = students[originalIndex]
      
      duplicates.push({
        type: 'name_batch',
        original: originalStudent,
        duplicate: student,
        originalIndex,
        duplicateIndex: index
      })
    } else {
      seen.set(key, index)
    }
  })
  
  return duplicates
}

// Function to check for potential duplicates (similar names)
function findPotentialDuplicates(students) {
  const potentialDuplicates = []
  
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const student1 = students[i]
      const student2 = students[j]
      
      const name1 = student1.name?.toLowerCase().trim() || ''
      const name2 = student2.name?.toLowerCase().trim() || ''
      const batch1 = student1.batch?.toLowerCase().trim() || ''
      const batch2 = student2.batch?.toLowerCase().trim() || ''
      
      // Check for similar names in the same batch (more likely to be duplicates)
      if (name1 && name2 && batch1 === batch2) {
        const name1Words = name1.split(' ')
        const name2Words = name2.split(' ')
        
        // Check if they share the first name in the same batch
        if (name1Words[0] === name2Words[0] && name1Words[0].length > 2) {
          potentialDuplicates.push({
            type: 'same_batch_similar_name',
            student1,
            student2,
            reason: `Both have first name "${name1Words[0]}" in batch "${student1.batch}"`,
            index1: i,
            index2: j
          })
        }
        
        // Check for very similar full names in the same batch
        if (name1 !== name2 && name1.length > 3 && name2.length > 3) {
          const similarity = calculateSimilarity(name1, name2)
          if (similarity > 0.8) { // 80% similarity threshold
            potentialDuplicates.push({
              type: 'same_batch_similar_spelling',
              student1,
              student2,
              reason: `Names are ${Math.round(similarity * 100)}% similar in batch "${student1.batch}"`,
              index1: i,
              index2: j
            })
          }
        }
      }
      
      // Check for same name in different batches (might be legitimate or duplicate)
      if (name1 === name2 && batch1 !== batch2) {
        potentialDuplicates.push({
          type: 'same_name_different_batch',
          student1,
          student2,
          reason: `Same name "${student1.name}" in different batches: "${student1.batch}" vs "${student2.batch}"`,
          index1: i,
          index2: j
        })
      }
    }
  }
  
  return potentialDuplicates
}

// Simple similarity calculation (Levenshtein distance based)
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

// Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

async function checkDuplicates() {
  const mongoUri = envVars.MONGODB_URI || process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in .env.local or environment variables')
    console.log('Please make sure your .env.local file contains: MONGODB_URI=your_mongodb_connection_string')
    return
  }
  
  const client = new MongoClient(mongoUri)
  
  try {
    await client.connect()
    console.log('🔍 Connected to MongoDB - Checking for duplicates...\n')
    
    const db = client.db()
    const studentsCollection = db.collection('students')
    
    // Get all students
    const students = await studentsCollection.find({}).toArray()
    console.log(`📊 Total students in database: ${students.length}\n`)
    
    if (students.length === 0) {
      console.log('✅ No students found in database')
      return
    }
    
    // Check for exact duplicates
    console.log('🔍 Checking for exact duplicates (same name + batch)...')
    const exactDuplicates = findDuplicates(students)
    
    if (exactDuplicates.length > 0) {
      console.log(`\n❌ Found ${exactDuplicates.length} exact duplicate(s):\n`)
      
      exactDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. DUPLICATE FOUND:`)
        console.log(`   Original: ${dup.original.name} (ID: ${dup.original._id})`)
        console.log(`   Contact: ${dup.original.contact || 'N/A'}`)
        console.log(`   Batch: ${dup.original.batch}`)
        console.log(`   Email: ${dup.original.email || 'N/A'}`)
        console.log(`   ─────────────────────────────────────────`)
        console.log(`   Duplicate: ${dup.duplicate.name} (ID: ${dup.duplicate._id})`)
        console.log(`   Contact: ${dup.duplicate.contact || 'N/A'}`)
        console.log(`   Batch: ${dup.duplicate.batch}`)
        console.log(`   Email: ${dup.duplicate.email || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('✅ No exact duplicates found')
    }
    
    // Check for potential duplicates
    console.log('\n🔍 Checking for potential duplicates (similar names)...')
    const potentialDuplicates = findPotentialDuplicates(students)
    
    if (potentialDuplicates.length > 0) {
      console.log(`\n⚠️  Found ${potentialDuplicates.length} potential duplicate(s):\n`)
      
      potentialDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. POTENTIAL DUPLICATE:`)
        console.log(`   Student 1: ${dup.student1.name} (ID: ${dup.student1._id})`)
        console.log(`   Contact: ${dup.student1.contact || 'N/A'}`)
        console.log(`   Batch: ${dup.student1.batch}`)
        console.log(`   ─────────────────────────────────────────`)
        console.log(`   Student 2: ${dup.student2.name} (ID: ${dup.student2._id})`)
        console.log(`   Contact: ${dup.student2.contact || 'N/A'}`)
        console.log(`   Batch: ${dup.student2.batch}`)
        console.log(`   Reason: ${dup.reason}`)
        console.log('')
      })
    } else {
      console.log('✅ No potential duplicates found')
    }
    
    // Summary
    console.log('📋 SUMMARY:')
    console.log(`   Total students: ${students.length}`)
    console.log(`   Exact duplicates: ${exactDuplicates.length}`)
    console.log(`   Potential duplicates: ${potentialDuplicates.length}`)
    
    if (exactDuplicates.length > 0 || potentialDuplicates.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      if (exactDuplicates.length > 0) {
        console.log('   - Review exact duplicates (same name + batch) and remove unnecessary entries')
        console.log('   - These are likely true duplicates that should be merged or removed')
      }
      if (potentialDuplicates.length > 0) {
        console.log('   - Review potential duplicates manually:')
        console.log('     • Same name in different batches: Check if student moved batches or if duplicate')
        console.log('     • Similar names in same batch: Check for typos or different students')
        console.log('     • Update contact information if needed')
      }
    } else {
      console.log('\n🎉 Great! No duplicates found in your student database.')
    }
    
  } catch (error) {
    console.error('❌ Error checking for duplicates:', error)
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Run the script
checkDuplicates()
