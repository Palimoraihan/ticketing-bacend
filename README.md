# Ticketing System Backend

A robust backend system for managing support tickets, built with Node.js, Express, and Sequelize.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Agent, Customer)
  - Secure password handling

- **Ticket Management**
  - Create, read, update, and delete tickets
  - File attachments support
  - Ticket responses and comments
  - Priority and status tracking

- **Group Management**
  - Create and manage support groups
  - Assign agents to groups
  - Group-specific tags and SLAs

- **Dashboard Analytics**
  - Role-specific dashboards
  - Ticket statistics and metrics
  - Performance tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Handling**: Multer

## Project Structure

```
backend/
├── config/
│   └── database.js      # Database configuration
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── uploads/            # File uploads directory
└── src/
    └── index.js        # Application entry point
```

## Models

- **User**: Manages user accounts and authentication
- **Ticket**: Core ticket management
- **Group**: Support group organization
- **Tag**: Ticket categorization
- **GroupAgent**: Agent-group associations
- **TicketResponse**: Ticket comments and updates
- **FileAttachment**: File management
- **SLAPolicy**: Service level agreements

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/responses` - Add response
- `POST /api/tickets/:id/attachments` - Add attachment

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Dashboard
- `GET /api/dashboard/customer` - Customer dashboard
- `GET /api/dashboard/agent` - Agent dashboard
- `GET /api/dashboard/admin` - Admin dashboard

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=ticketing_system
   JWT_SECRET=your_jwt_secret
   ```

3. Initialize database:
   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Development

- Run tests:
  ```bash
  npm test
  ```

- Run in development mode:
  ```bash
  npm run dev
  ```

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Secure file upload handling

## Error Handling

- Centralized error handling
- Custom error classes
- Detailed error responses
- Logging and monitoring

## Recent Updates

- Implemented role-based dashboards
- Added ticket statistics and metrics
- Enhanced group and agent management
- Improved file attachment handling
- Optimized database queries
- Added performance tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 