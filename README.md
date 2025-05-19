# SkillSwap Backend
[![Release](https://img.shields.io/github/v/release/oSkillSwap/skillswap-back?color=blue&label=version)](https://github.com/oSkillSwap/skillswap-back/releases)
![Node.js Version](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)
![PostgreSQL Version](https://img.shields.io/badge/PostgreSQL-16-blue.svg)
![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)

## 📋 Description

SkillSwap is a backend API designed to facilitate skill exchange between users. This project provides a robust RESTful API for managing users, skills, offers, and messaging, built with Node.js, Express, and PostgreSQL.

## ✨ Features

- 🔐 User authentication and authorization (JWT)
- 🧠 Skill and offer management
- 💬 Real-time messaging (Socket.io)
- 📤 File uploads (Multer, Sharp)
- 📧 Email notifications (Nodemailer)
- ✅ Data validation (Zod, Validator)
- 📚 API documentation (Swagger)
- 🔒 Secure password hashing (Argon2)
- 🧹 Input sanitization

## 🛠️ Tech Stack

- **Backend:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/): Server and routing
  - [PostgreSQL](https://www.postgresql.org/) & [Sequelize](https://sequelize.org/): Database and ORM
  - [Socket.io](https://socket.io/): Real-time communication
  - [JWT](https://jwt.io/): Token-based authentication
  - [Multer](https://github.com/expressjs/multer) & [Sharp](https://sharp.pixelplumbing.com/): File handling and processing
  - [Swagger](https://swagger.io/): API documentation
  - [Nodemailer](https://nodemailer.com/): Email sending

- **Development Tools:**
  - [ESLint](https://eslint.org/): Code linting
  - [Jest](https://jestjs.io/) & [Supertest](https://github.com/visionmedia/supertest): Testing
  - [Husky](https://typicode.github.io/husky/#/): Git hooks
  - [Dotenv](https://github.com/motdotla/dotenv): Environment variables management

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/oSkillSwap/skillswap-back.git
   cd skillswap-back
   git checkout dev
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn
   ```

3. **Configure environment variables:**
   ```sh
   cp .env.example .env
   # Edit the .env file with your own values
   ```

4. **Set up the database:**
   ```sh
   # Create the database
   npm run db:create
   # or
   yarn db:create

   # Load test data (optional)
   npm run db:seed
   # or
   yarn db:seed
   ```

### Running the Server

- **Development mode (with hot reload):**
  ```sh
  npm run dev
  # or
  yarn dev
  ```

### Tests

```sh
# Run all tests
npm test
# or
yarn test
```

## 📚 API Documentation

Swagger documentation is available at the `/docs` URL when the server is running.

To explore the API:
1. Start the server in development mode
2. Navigate to `http://localhost:3000/docs` in your browser

## 📁 Project Structure

```
app/
├── controllers/           # Route handlers and business logic
│   ├── admin.controller.js
│   ├── message.controller.js
│   ├── post.controller.js
│   ├── proposition.controller.js
│   └── user.controller.js
├── data/                 # Database setup
│   ├── client.js         # Database connection
│   ├── create-tables.js  # Schema creation
│   └── seed-tables.js    # Test data generation
├── errors/               # Custom error classes
├── helpers/              # Utility functions
│   ├── jwt.js            # JWT handling
│   └── mail.js           # Email sending
├── middlewares/          # Express middlewares
│   ├── authenticate.js   # JWT authentication
│   ├── validates.js      # Request validation
│   └── upload.middleware.js # File uploads
├── models/              # Sequelize models
│   ├── associations.js  # Model relationships
│   ├── user.model.js
│   └── ...
├── routers/            # Route definitions
├── schemas/            # Zod validation schemas
├── sockets/            # Socket.IO handlers
└── views/              # EJS templates
```

## 📋 Main API Routes

| Method | Route                   | Description                     |
|--------|-------------------------|---------------------------------|
| POST   | `/auth/register`    | Register a new user             |
| POST   | `/auth/login`       | User login                      |
| GET    | `/skills`           | List all skills                 |
| POST   | `/offers`           | Create a new offer              |
| GET    | `/offers`           | Search for offers               |
| GET    | `/users/:id`        | User profile                    |
| POST   | `/messages/:id`     | Send a message                  |

All API routes and endpoints are fully documented and can be explored via our [Swagger documentation](https://skillswap.olivier-renard.com/api/docs/) 

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- [Erwan Mettouchi](https://github.com/ErwanMettouchi)
- [Gregory Virmaud](https://github.com/gregv74)
- [Olivier Renard](https://github.com/renardoli)
