# Indigov Constituent Management System

A full-stack application for managing constituents, built as a take-home project. The system allows users to add, view, and import constituents through a modern web interface with authentication.

## Tech Stack

### Backend
- **Node.js** with **Express** - For the server and API endpoints
- **TypeScript** - For type safety and better developer experience
- **JWT** (jsonwebtoken) - For authentication
- **bcryptjs** - For password hashing
- **multer** - For handling file uploads
- **csv-parse/csv-writer** - For CSV file processing

### Frontend
- **React** with **TypeScript** - For building the user interface
- **Tailwind CSS** - For styling
- **React Hooks** - For state management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jessicatitus/constituent-management-system.git
cd constituent-management-system
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

### Running the Application

1. Start the backend server:
```bash
npm run dev
```
The server will start on http://localhost:3001

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```
The frontend will start on http://localhost:3000

### Seeding Data

The application comes with a seed script to populate initial data:
```bash
npm run seed
```

## Login Credentials

You can use the following credentials to log in:
- Email: admin@indigov.com
- Password: grit

By running this:
```bash
  curl -X POST http://localhost:3001/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@indigov.com", "password": "grit", "firstName": "Admin", "lastName": "User"}'
  ```

Or register a new account through the registration endpoint:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword", "firstName": "Your", "lastName": "Name"}'
```

## Data Storage

The application currently uses in-memory storage for both users and constituents. This was chosen for simplicity and to avoid setting up a database for the take-home project. The in-memory data store is implemented through a Map data structure in src/storage/database.ts, with data persistence achieved by writing to a JSON file (data/constituents.json). While this approach is simple and doesn't require a database setup, it means the data is lost when the server restarts and isn't suitable for production use. In a production environment, this would be replaced with a proper database (e.g., PostgreSQL).

### Tradeoffs Made
1. **In-memory Storage**
   - Pros: Simple to implement, no database setup required
   - Cons: Data is lost on server restart, not suitable for production

2. **JWT Authentication**
   - Pros: Stateless, scalable, no session storage needed
   - Cons: Tokens can't be invalidated before expiration

3. **CSV Import/Export**
   - Pros: Familiar format for users, easy to work with
   - Cons: Limited validation compared to a form-based approach

## Scalability Considerations

The current implementation is designed for demonstration purposes and would need significant modifications to handle production-scale loads.
If many Officials were using this software to manage their constituents, here are key considerations for scaling the system:

### Data Storage
- Replace in-memory storage with a proper database (PostgreSQL, MongoDB)
- Implement database indexing for efficient queries
- Consider data partitioning by district/region
- Add caching for frequently accessed constituent profiles

### Event Management
- Support multiple concurrent event check-ins
- Handle bulk imports from event sign-up sheets
- Implement offline mode for poor connectivity at events
- Add real-time sync when connection is restored

### User Management
- Support multiple staff members per office
- Implement role-based access (admin, event staff, read-only)
- Add audit logs for constituent data changes
- Enable district-specific data isolation

### Data Processing
- Optimize CSV processing for event sign-up sheets
- Implement background processing for large imports
- Add duplicate detection across events
- Support merging of constituent records

### Security & Compliance
- Implement proper data encryption for sensitive constituent information
- Add data privacy controls for personal information
- Set up secure access for remote staff
- Maintain data retention policies
- Comply with relevant data protection regulations (e.g., state privacy laws)
- Implement secure data sharing between offices when constituents move districts

## Features

1. **Authentication**
   - Login with email/password
   - JWT-based session management
   - Protected routes

2. **Constituent Management**
   - Add new constituents manually
   - Adding a duplicate email with new address with automatically update the constituent address
   - Import constituents via CSV
   - View list of all constituents
   - Export constituents to CSV

3. **CSV Import/Export**
   - Supports standard CSV format
   - Validates data during import
   - Handles errors gracefully
   - Provides import results summary

## API Endpoints

### Public Routes
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Protected Routes (require authentication)
- `GET /constituents` - Get all constituents
- `POST /constituents` - Add a new constituent
- `POST /constituents/import` - Import constituents from CSV
- `GET /constituents/export` - Export constituents to CSV


## Project Structure

```
indigov-take-home/
├── src/                    # Backend source code
│   ├── middleware/        # Authentication and other middleware
│   ├── models/           # TypeScript interfaces and types
│   ├── routes/           # API route handlers
│   ├── scripts/          # Utility scripts (seeding, etc.)
│   ├── storage/          # Data storage implementation
│   ├── utils/            # Helper functions
│   └── server.ts         # Main server file
│
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types/        # TypeScript type definitions
│   │   └── App.tsx       # Main application component
│   └── public/           # Static assets
│
├── data/                  # Persistent data storage
│   └── constituents.json # Constituent data file
│
├── uploads/              # Temporary storage for file uploads
│
├── dist/                 # Compiled JavaScript (ignored in git)
│
└── node_modules/         # Dependencies (ignored in git)
```

### Key Directories

- **src/**: Contains all backend TypeScript source code
  - `middleware/`: Authentication and request processing
  - `models/`: Data type definitions
  - `routes/`: API endpoint handlers
  - `storage/`: Data persistence implementation
  - `utils/`: Helper functions and utilities

- **frontend/**: React application
  - `components/`: Reusable UI components
  - `types/`: TypeScript type definitions
  - `public/`: Static assets and HTML template

- **data/**: Persistent storage
  - Stores constituent data in JSON format
  - Maintains data between server restarts

- **uploads/**: Temporary storage
  - Used for processing CSV file uploads
  - Files are automatically cleaned up after processing

- **dist/**: Compiled output
  - Generated JavaScript files
  - Not tracked in git (regenerated on build)


##Potential Future Improvements

1. Add a proper database (PostgreSQL)
2. Implement user roles and permissions
3. Add tests

