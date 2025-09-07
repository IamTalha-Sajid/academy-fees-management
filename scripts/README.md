# Scripts

This directory contains utility scripts for the Academy Fees Management system.

## Fix Student Names Script

### Purpose
Converts all existing student names in the database to proper case (first letter of each word capitalized).

### Usage

#### Option 1: Using npm script (Recommended)
```bash
npm run fix-names
```

#### Option 2: Direct execution
```bash
node scripts/fix-student-names.js
```

### What it does
- Connects to your MongoDB database using the `MONGODB_URI` from `.env.local`
- Finds all students in the database
- Converts names like "john doe" → "John Doe"
- Converts names like "MARY JANE SMITH" → "Mary Jane Smith"
- Only updates names that actually need conversion
- Provides detailed logging of all changes made

### Example Output
```
Connected to MongoDB
Found 15 students to process
Updated: "john doe" → "John Doe"
Updated: "MARY JANE SMITH" → "Mary Jane Smith"
No change needed: "Ahmed Ali"
Updated: "fatima khan" → "Fatima Khan"
...

✅ Successfully updated 8 student names
📊 Total students processed: 15
Disconnected from MongoDB
```

### Safety Features
- Only updates names that actually need conversion
- Uses MongoDB's atomic update operations
- Provides detailed logging
- Gracefully handles errors
- Automatically closes database connection

### Requirements
- Node.js installed
- MongoDB connection string in `.env.local`
- `mongodb` package installed (should be available in the project)

## Check Duplicates Script

### Purpose
Scans the student database for duplicate entries and potential duplicates to help maintain data integrity.

### Usage

#### Option 1: Using npm script (Recommended)
```bash
npm run check-duplicates
```

#### Option 2: Direct execution
```bash
node scripts/check-duplicates.js
```

### What it does
- Connects to your MongoDB database using the `MONGODB_URI` from `.env.local`
- Scans all students in the database
- Identifies **exact duplicates** (same name + batch)
- Identifies **potential duplicates** (similar names, same names in different batches)
- Uses advanced similarity algorithms to detect typos and variations
- Provides detailed reports with recommendations

### Types of Duplicates Detected

#### 1. Exact Duplicates
- Same name AND same batch
- These are likely true duplicates that should be merged or removed

#### 2. Potential Duplicates
- **Same Name, Different Batch**: Student with same name in different batches (check if moved or duplicate)
- **Similar Names, Same Batch**: Students with similar names in the same batch (check for typos)
- **Similar Spelling**: Names that are 80%+ similar in the same batch (handles typos)

### Example Output
```
🔍 Connected to MongoDB - Checking for duplicates...

📊 Total students in database: 68

🔍 Checking for exact duplicates (same name + contact)...
✅ No exact duplicates found

🔍 Checking for potential duplicates (similar names)...
⚠️  Found 3 potential duplicate(s):

1. POTENTIAL DUPLICATE:
   Student 1: Ahmad Ali (ID: 507f1f77bcf86cd799439011)
   Contact: 03001234567
   Batch: Batch A
   ─────────────────────────────────────────
   Student 2: Ahmad Khan (ID: 507f1f77bcf86cd799439012)
   Contact: 03001234568
   Batch: Batch B
   Reason: Both have first name: "ahmad"

📋 SUMMARY:
   Total students: 68
   Exact duplicates: 0
   Potential duplicates: 3

💡 RECOMMENDATIONS:
   - Review potential duplicates manually
   - Check if they are the same person with different spellings
   - Update contact information if needed

🔌 Disconnected from MongoDB
```

### Safety Features
- **Read-only operation** - No data is modified
- **Detailed reporting** - Shows exactly what was found
- **Smart algorithms** - Uses Levenshtein distance for similarity
- **Multiple detection methods** - Catches various types of duplicates
- **Clear recommendations** - Suggests next steps for each type

### Requirements
- Node.js installed
- MongoDB connection string in `.env.local`
- `mongodb` package installed (should be available in the project)
