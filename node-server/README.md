# BookStore Node.js Server

A comprehensive Node.js backend server for the BookStore application with authentication, book management, and MCP integration.

## Features

- **Authentication**: User registration, login, JWT-based authentication
- **Book Management**: CRUD operations for books with search functionality
- **Role-based Access Control**: Admin and user roles
- **MCP Integration**: Model Context Protocol server integration
- **Security**: Rate limiting, CORS, helmet security headers
- **Logging**: Comprehensive logging system
- **Error Handling**: Centralized error handling middleware

## Project Structure

```
node-server/
├── config/
│   └── db.js                  # MySQL connection and query helper
├── controllers/
│   ├── authController.js      # Authentication logic
│   └── bookController.js      # Book management logic
├── middleware/
│   ├── authMiddleware.js      # JWT authentication
│   ├── errorMiddleware.js     # Error handling
│   └── roleMiddleware.js      # Role-based access control
├── routes/
│   ├── authRoutes.js          # Authentication routes
│   ├── bookRoutes.js          # Book management routes
│   └── index.js               # Route aggregation
├── services/
│   ├── mcpService.js          # MCP server integration
│   └── authService.js         # Authentication utilities
├── utils/
│   ├── helpers.js             # Utility functions
│   └── logger.js              # Logging system
├── models/                    # Placeholder for future ORM models
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
├── server.js                  # Main server file
└── README.md                  # This file
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=agent
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Connect to the existing Laravel database**:
   - Point the Node server to the same MySQL database used by Laravel.
   - In this repo, the Laravel backend is configured for database `agent` in `backend/.env`.
   - The safest migration path is: reuse the current schema first, then only add Node-side schema changes if truly needed.

## Knex Migrations (Use With Care)

This Node server includes Knex migrations that mirror the Laravel backend schema for reference and bootstrap purposes.

If you are migrating from the existing Laravel backend, do not run these migrations against the live database by default. The tables already exist there, and replaying them from Node can cause conflicts.

1. Check migration status:
   ```bash
   npm run migrate:status
   ```

2. Only run schema-changing Knex commands when you explicitly opt in:
   ```bash
   ALLOW_SCHEMA_CHANGES=true npm run migrate
   ```

3. Rollback last batch if needed:
   ```bash
   ALLOW_SCHEMA_CHANGES=true npm run migrate:rollback
   ```

The normal path for this project is:
- Keep Laravel and Node pointed at the same existing MySQL database.
- Port Laravel endpoints to Node incrementally.
- Avoid recreating tables unless you are working in a fresh database on purpose.

## Running the Server

1. **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```

2. **Production mode**:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/search` - Search books
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Health Check
- `GET /api/health` - Server health check
- `GET /health` - Basic health check

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The server uses centralized error handling with appropriate HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Logging

The server includes comprehensive logging:
- Request/response logging
- Database query logging
- Authentication event logging
- Error logging with stack traces

Logs are stored in the `logs/` directory with date-based filenames.

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Input Validation**: Sanitization and validation
- **Password Hashing**: bcrypt for secure password storage

## MCP Integration

The server includes MCP (Model Context Protocol) integration for AI/ML capabilities:
- Automatic MCP server startup
- Command interface for MCP operations
- Graceful shutdown handling

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | (empty) |
| DB_NAME | Database name | bookstore |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | Token expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Development

The project is set up for development with:
- Nodemon for auto-restart on file changes
- Detailed logging in development mode
- Environment-based configuration

## Contributing

1. Follow the existing code style
2. Add appropriate logging
3. Handle errors properly
4. Update documentation as needed
