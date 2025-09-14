# Yardstick - Multi-tenant SaaS Application

A full-stack multi-tenant SaaS application with subscription plans, user roles, and tenant isolation.

## Features

- **Multi-tenancy**: Complete tenant isolation with subscription plans (Free/Pro)
- **User Authentication**: JWT-based authentication with role-based access control
- **Notes Management**: CRUD operations for notes with tenant isolation
- **Subscription Plans**:
  - Free: Limited to 3 notes per tenant
  - Pro: Unlimited notes
- **Admin Dashboard**: Admin users can upgrade tenant subscription plans

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Middleware for tenant isolation and subscription limits

### Frontend
- React with React Router
- Context API for state management
- Axios for API requests
- Modern UI with CSS variables

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application component
│   └── package.json        # Frontend dependencies
│
└── server/                 # Backend Express application
    ├── config/             # Configuration files
    ├── middleware/         # Custom middleware
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── package.json        # Backend dependencies
    └── vercel.json         # Vercel deployment configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/yardstick.git
   cd yardstick
   ```

2. Install backend dependencies
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

### Running the Application

1. Start the backend server
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd ../client
   npm run dev
   ```

3. Seed the database with test data
   ```bash
   cd ../server
   npm run seed
   ```

4. Access the application at `http://localhost:5173`

### Test Accounts

- Admin User:
  - Email: admin@example.com
  - Password: password123

- Member User (Free Plan):
  - Email: member@example.com
  - Password: password123

## Deployment

The application is configured for deployment on Vercel:

1. Backend: Deploy the `server` directory as a Vercel serverless function
2. Frontend: Deploy the `client` directory as a static site

## Multi-tenancy Approach

This application implements multi-tenancy using the following approach:

1. **Database-level Isolation**: Each tenant has a unique `tenantId` that is used to filter data
2. **Middleware Protection**: Custom middleware ensures users can only access data from their own tenant
3. **Subscription Enforcement**: Middleware checks subscription plans before allowing certain operations
4. **JWT with Tenant Context**: Authentication tokens include tenant information for seamless security

## License

MIT