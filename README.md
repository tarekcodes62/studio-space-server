# StudioSpace - Backend API

StudioSpace is a creative studio marketplace backend API built with Node.js,
Express.js, and MongoDB. It provides RESTful APIs for managing studio listings,
user bookings, authentication, and dashboard statistics.

## 🚀 Live API

[Visit Backend API](https://studio-space-server-dusky.vercel.app/)

## ✨ Features

- RESTful API development using Express.js.
- MongoDB database integration.
- Create, read, update, and delete studio listings.
- Retrieve studios by category.
- View detailed studio information.
- Manage user-specific studio listings.
- Create and manage studio bookings.
- Retrieve user-specific bookings.
- Update booking statuses.
- Dashboard statistics and booking management.
- JWT-based authentication and token verification.
- Secure API access and error handling.
- CORS configuration for frontend integration.
- Environment variable configuration.

## 🛠️ Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB
- REST API

### Authentication & Security

- JWT (JSON Web Token)
- Jose
- Better Auth Integration

### Tools & Deployment

- dotenv
- CORS
- Vercel

## 📦 Dependencies

- express
- mongodb
- cors
- dotenv
- jose

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd studiospace-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

DB_NAME=your_database_name

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:3000
```

### 5. Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run at:

```text
http://localhost:5000
```

## 📁 Project Structure

```text
studiospace-server/
│
├── index.js
├── package.json
├── .env
├── .gitignore
│
└── ...
```

## 📡 API Endpoints

### Studio APIs

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | `/studios`            | Get all studios            |
| GET    | `/studios/:id`        | Get studio details         |
| POST   | `/studios`            | Add a new studio           |
| PATCH  | `/studios/:id`        | Update studio information  |
| DELETE | `/studios/:id`        | Delete a studio            |
| GET    | `/my-listings/:email` | Get user's studio listings |

### Booking APIs

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| POST   | `/my-bookings`         | Create a new booking  |
| GET    | `/my-bookings/:userId` | Get user's bookings   |
| PATCH  | `/my-bookings/:id`     | Update booking status |
| DELETE | `/my-bookings/:id`     | Delete a booking      |

### Dashboard API

| Method | Endpoint     | Description                                      |
| ------ | ------------ | ------------------------------------------------ |
| GET    | `/dashboard` | Get dashboard statistics and booking information |

## 🗄️ Database Collections

StudioSpace uses MongoDB with the following collections:

### 1. studiosCollection

Stores:

- Studio name and description.
- Category and category slug.
- Studio images.
- Hourly rate and security deposit.
- Location information.
- Amenities and equipment.
- Host information.

### 2. bookingsCollection

Stores:

- User ID.
- Studio ID.
- Studio name and image.
- Booking date.
- Start time and duration.
- Total price.
- Booking status.

## 🔐 Authentication & Security

- Better Auth integration.
- JWT-based token verification using Jose.
- Protected API routes.
- User-specific studio listing management.
- User-specific booking management.
- CORS configuration.
- Environment variables for sensitive credentials.

## 🌐 Frontend Integration

The backend API is integrated with the StudioSpace frontend built using Next.js.

The frontend communicates with the backend through REST API requests to retrieve
studio information, create bookings, manage listings, and display dashboard
statistics.

## 🎯 Project Goal

The goal of StudioSpace is to connect creative professionals with studio owners
through a modern and user-friendly marketplace.

It provides a reliable backend system for discovering, booking, and managing
creative spaces.

---

## 👨‍💻 Developer

**Tarek Rahman**

- GitHub: [tarekcodes62](https://github.com/tarekcodes62)
- LinkedIn: [Tarek Rahman](https://www.linkedin.com/in/tarek-rahman1/)

---

**Developed with ❤️ by Tarek Rahman**
