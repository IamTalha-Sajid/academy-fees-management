# The Universal Academy - Fees Management System

A comprehensive fees management system built with Next.js, TypeScript, and Tailwind CSS. This application provides a complete solution for managing students, batches, teachers, fee collections, and salary payments without requiring a traditional database.

## Features

### 🏠 Dashboard
- Real-time statistics and metrics
- Recent payment tracking
- Upcoming dues overview
- Quick action shortcuts
- Monthly revenue and pending fees summary

### 👥 Student Management
- Add, edit, and delete student records
- Search and filter students by name, batch, or contact
- Track student status (active/inactive)
- Manage student batches and fees
- **Optional email and contact fields** for flexibility
- Real-time data persistence

### 📚 Batch Management
- Create and manage class batches
- Assign teachers to batches
- Track batch schedules and fees
- Monitor student enrollment
- Batch status management (active/inactive)

### 👨‍🏫 Teacher Management
- Complete teacher profile management
- Track teacher assignments and subjects
- **Salary payment tracking system**
- Teacher status management (active/inactive)
- **Optional email and contact fields**
- Monthly salary budget tracking

### 💰 Fee Collection
- **Dynamic fee generation** for current month only
- Mark fee payments as paid/pending/overdue
- Filter by batch, month, and year
- Track payment methods (Cash, Bank Transfer, Cheque, UPI)
- **Overdue fee accumulation** with visual indicators
- **Export reports** (CSV and detailed text)
- **Copy summary** to clipboard
- Real-time collection statistics
- **Regenerate fees** functionality for data integrity

### 💵 Salary Management
- **Complete salary payment tracking**
- Record partial and full salary payments
- Track payment history by teacher
- Monthly salary budget vs actual payments
- Payment method tracking
- Salary payment reports and analytics

### 📊 Reports
- **Functional financial reports** with real data
- Payment status tracking
- Revenue analysis by year
- Outstanding fee reports
- **Defaulter calculations**
- Year-wise filtering

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Data Storage**: JSON file-based storage
- **State Management**: React hooks
- **Currency**: Pakistani Rupees (Rs.)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fees-management
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Structure

The application uses a JSON file (`lib/data.json`) to store all data:

```json
{
  "students": [
    {
      "id": 1,
      "name": "Student Name",
      "batch": "Class 10-A",
      "fees": 5000,
      "contact": "9876543210",
      "email": "student@email.com",
      "address": "Student Address",
      "status": "active",
      "joinDate": "2024-01-15"
    }
  ],
  "batches": [...],
  "teachers": [...],
  "feeRecords": [...],
  "salaryRecords": [...]
}
```

## API Endpoints

The application includes comprehensive API routes for data operations:

- `GET /api/data` - Fetch all data
- `POST /api/data` - Update data with actions:
  - **Student Operations**: `createStudent`, `updateStudent`, `deleteStudent`
  - **Batch Operations**: `createBatch`, `updateBatch`, `deleteBatch`
  - **Teacher Operations**: `createTeacher`, `updateTeacher`, `deleteTeacher`
  - **Fee Operations**: `createFeeRecord`, `updateFeeRecord`, `deleteFeeRecord`, `markFeePaid`, `markFeePending`
  - **Salary Operations**: `createSalaryRecord`, `updateSalaryRecord`, `deleteSalaryRecord`

## Usage Guide

### Adding a New Student
1. Navigate to "Student Management"
2. Click "Add New Student"
3. Fill in the required information (name, batch, fees, address)
4. **Email and contact are optional**
5. Select a batch from the dropdown
6. Set the monthly fees
7. Click "Add Student"

### Managing Fee Payments
1. Go to "Fee Collection"
2. **Select month and year** (fees generate automatically for current month)
3. Use filters to find specific records
4. Click "Mark Paid" to record a payment
5. **Export reports** or **copy summary** for sharing
6. View payment statistics in the summary cards

### Managing Teacher Salaries
1. Navigate to "Teacher Management"
2. Go to "Salary Management" tab
3. Click "Add Salary Payment"
4. Select teacher, amount, month/year
5. Record payment method and notes
6. Track payment history and remaining amounts

### Creating Batches
1. Navigate to "Batch Management"
2. Click "Add New Batch"
3. Enter batch details and assign a teacher
4. Set the fee structure and schedule
5. Manage batch status

## File Structure

```
├── app/
│   ├── api/data/route.ts    # API endpoints
│   ├── students/page.tsx     # Student management
│   ├── fees/page.tsx        # Fee collection
│   ├── batches/page.tsx     # Batch management
│   ├── teachers/page.tsx    # Teacher management
│   ├── reports/page.tsx     # Reports
│   └── page.tsx             # Dashboard
├── components/
│   ├── ui/                  # UI components
│   └── app-sidebar.tsx      # Navigation sidebar
├── lib/
│   ├── data.json            # Data storage
│   └── dataService.ts       # Data service layer
└── styles/
    └── globals.css          # Global styles
```

## Key Features

### ✅ Fully Functional
- Complete CRUD operations for all entities
- Real-time data persistence
- Search and filtering capabilities
- Responsive design
- **Salary payment tracking**
- **Export functionality**

### ✅ No Database Required
- JSON file-based storage
- Simple setup and deployment
- Easy data backup and migration
- **Automatic data validation**

### ✅ Modern UI/UX
- Clean, professional interface
- Mobile-responsive design
- Intuitive navigation
- Loading states and error handling
- **Visual indicators for overdue fees**
- **Summary cards with key metrics**

### ✅ Type Safety
- Full TypeScript implementation
- Type-safe data operations
- Compile-time error checking
- **Proper interface definitions**

### ✅ Smart Features
- **Dynamic fee generation** (current month only)
- **Overdue fee accumulation**
- **Optional contact fields**
- **Current year support (2025)**
- **Export and copy functionality**
- **Real-time calculations**

## Development

### Adding New Features
1. Update the data structure in `lib/data.json`
2. Add corresponding types in `lib/dataService.ts`
3. Create API endpoints in `app/api/data/route.ts`
4. Build UI components in the appropriate page

### Data Backup
The application data is stored in `lib/data.json`. To backup:
1. Copy the `lib/data.json` file
2. Store it in a safe location
3. Restore by replacing the file

## Recent Updates

### ✅ Latest Improvements
- **Salary Management System**: Complete teacher salary tracking
- **Optional Contact Fields**: Email and phone numbers are now optional
- **Current Year Support**: Updated to support 2025
- **Export Functionality**: CSV and text report generation
- **Overdue Fee Logic**: Proper accumulation and visual indicators
- **Dynamic Fee Generation**: Fees only generate for current month
- **Real-time Data**: All operations persist immediately
- **Enhanced UI**: Better visual feedback and user experience

## Deployment

This application can be deployed to any platform that supports Next.js:

- **Vercel**: Recommended for easy deployment
- **Netlify**: Alternative hosting option
- **Self-hosted**: Any Node.js server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

---

**The Universal Academy** - Making education management simple and efficient. 
