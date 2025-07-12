# The Universal Academy - Fees Management System

A comprehensive fees management system built with Next.js, TypeScript, and Tailwind CSS. This application provides a complete solution for managing students, batches, teachers, and fee collections without requiring a traditional database.

## Features

### 🏠 Dashboard
- Real-time statistics and metrics
- Recent payment tracking
- Upcoming dues overview
- Quick action shortcuts

### 👥 Student Management
- Add, edit, and delete student records
- Search and filter students
- Track student status (active/inactive)
- Manage student batches and fees

### 📚 Batch Management
- Create and manage class batches
- Assign teachers to batches
- Track batch schedules and fees
- Monitor student enrollment

### 👨‍🏫 Teacher Management
- Manage teacher profiles
- Track teacher assignments
- Monitor salary information
- Teacher status management

### 💰 Fee Collection
- Mark fee payments as paid/pending
- Filter by batch, month, and year
- Track payment methods
- Generate payment reports
- Real-time collection statistics

### 📊 Reports
- Financial reports and analytics
- Payment status tracking
- Revenue analysis
- Outstanding fee reports

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Data Storage**: JSON file-based storage
- **State Management**: React hooks

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
  "feeRecords": [...]
}
```

## API Endpoints

The application includes API routes for data operations:

- `GET /api/data` - Fetch all data
- `POST /api/data` - Update data with actions:
  - `createStudent` - Add new student
  - `updateStudent` - Update student information
  - `deleteStudent` - Remove student
  - `markFeePaid` - Mark fee as paid
  - `markFeePending` - Mark fee as pending

## Usage Guide

### Adding a New Student
1. Navigate to "Student Management"
2. Click "Add New Student"
3. Fill in the required information
4. Select a batch from the dropdown
5. Set the monthly fees
6. Click "Add Student"

### Managing Fee Payments
1. Go to "Fee Collection"
2. Use filters to find specific records
3. Click "Mark Paid" to record a payment
4. View payment statistics in the summary cards

### Creating Batches
1. Navigate to "Batch Management"
2. Click "Add New Batch"
3. Enter batch details and assign a teacher
4. Set the fee structure

## File Structure

```
├── app/
│   ├── api/data/route.ts    # API endpoints
│   ├── students/page.tsx     # Student management
│   ├── fees/page.tsx        # Fee collection
│   ├── batches/page.tsx     # Batch management
│   ├── teachers/page.tsx    # Teacher management
│   ├── reports/page.tsx     # Reports
│   ├── settings/page.tsx    # Settings
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

### ✅ No Database Required
- JSON file-based storage
- Simple setup and deployment
- Easy data backup and migration

### ✅ Modern UI/UX
- Clean, professional interface
- Mobile-responsive design
- Intuitive navigation
- Loading states and error handling

### ✅ Type Safety
- Full TypeScript implementation
- Type-safe data operations
- Compile-time error checking

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