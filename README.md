# Ticketing System

A comprehensive ticketing system built with Node.js, Express, and Sequelize.

## Features

### User Management
- User registration and authentication
- Role-based access control (Customer, Agent, Admin)
- Profile management

### Ticket Management
- Create, view, update, and close tickets
- Priority levels (low, medium, high, critical)
- Tag-based categorization
- Ticket responses and communication
- Automatic ticket closure based on SLA

### Group Management
- Create and manage agent groups
- Assign tags to groups
- Assign agents to groups

### SLA (Service Level Agreement) Management
- Define response and resolution times for each priority level
- Automatic due date calculation based on priority
- Automatic ticket closure when response time is exceeded

### Tag Management
- Create and manage tags
- Assign tags to tickets and groups
- Filter tickets by tags

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get all tickets (filtered by user role)
- `GET /api/tickets/:id` - Get a specific ticket
- `PATCH /api/tickets/:id` - Update a ticket
- `POST /api/tickets/:id/responses` - Add a response to a ticket

### Admin
- `POST /api/admin/tags` - Create a new tag
- `GET /api/admin/tags` - Get all tags
- `PATCH /api/admin/tags/:id` - Update a tag
- `POST /api/admin/groups` - Create a new group
- `GET /api/admin/groups` - Get all groups
- `PATCH /api/admin/groups/:id` - Update a group
- `POST /api/admin/sla-policies` - Create a new SLA policy
- `GET /api/admin/sla-policies` - Get all SLA policies
- `PATCH /api/admin/sla-policies/:id` - Update an SLA policy

## Database Schema

### Users
- id (Primary Key)
- name
- email
- password
- role (customer, agent, admin)

### Tickets
- id (Primary Key)
- title
- description
- status (open, in_progress, resolved, closed)
- priority (low, medium, high, critical)
- responseDueDate
- resolutionDueDate
- customerId (Foreign Key)
- agentId (Foreign Key)

### Groups
- id (Primary Key)
- name
- description

### Tags
- id (Primary Key)
- name
- description

### SLAPolicies
- id (Primary Key)
- priority (low, medium, high, critical)
- responseTime (in hours)
- resolutionTime (in hours)

### TicketResponses
- id (Primary Key)
- content
- ticketId (Foreign Key)
- userId (Foreign Key)

## Automatic Features

### Ticket Due Dates
- Response due date is calculated based on ticket priority and SLA policy
- Resolution due date is calculated based on ticket priority and SLA policy
- Due dates are automatically updated when ticket priority changes

### Automatic Ticket Closure
- System checks for overdue tickets every minute
- Tickets are automatically closed when response time is exceeded
- Closed tickets cannot be reopened without admin intervention

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```
4. Run the database migrations:
   ```bash
   npm run migrate
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Development

- The system uses Sequelize as ORM
- JWT for authentication
- Role-based middleware for access control
- Automatic ticket monitoring job for SLA compliance

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 