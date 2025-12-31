# ScrollJob Backend API

> A clean production-ready REST API for job listings and employment news built with Node.js, Express, and MongoDB.

[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Overview

ScrollJob is a lightweight backend service designed for modern job platforms. It provides a simple, scroll-based interface for listing job openings, internships, and employment news in an Inshorts-style format.

**Key Features:**
- RESTful API with versioning (v1)
- Soft delete support
- Pagination and search
- Rate limiting and security headers
- Production-ready error handling
- Optimized database queries



##  Quick Start

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scrolljob-backend.git
cd scrolljob-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI
nano .env

# Start the server
npm start
```



## 📁 Project Structure

```
backend/
├── server.js              # Application entry point
├── config/
│   └── db.js             # Database connection
├── models/
│   ├── Job.js            # Job schema
│   └── JobNews.js        # Job news schema
├── routes/
│   ├── job.routes.js     # Job endpoints
│   └── news.routes.js    # News endpoints
├── package.json
├── .env.example
└── README.md
```



## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/scrolljob

# Server
PORT=5000
NODE_ENV=development

# Frontend (optional for CORS)
FRONTEND_URL=http://localhost:3000
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port (optional) | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://scrolljob.in` |



## 📡 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Response Format

All responses follow this structure:

```json
{
  "status": "success" | "error",
  "message": "Optional message",
  "data": { ... }
}
```



## 🔵 Job Endpoints

### Create Job

```http
POST /api/v1/jobs
```

**Request Body:**
```json
{
  "title": "Senior Backend Engineer",
  "company": "Google",
  "location": "Remote",
  "applyLink": "https://careers.google.com/apply"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Job created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Backend Engineer",
    "company": "google",
    "location": "Remote",
    "applyLink": "https://careers.google.com/apply",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```



### Get All Jobs

```http
GET /api/v1/jobs?limit=20&page=1&company=google
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Items per page |
| `page` | number | 1 | Page number |
| `company` | string | - | Filter by company name |

**Response:** `200 OK`
```json
{
  "status": "success",
  "results": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [ ... ]
}
```



### Get Single Job

```http
GET /api/v1/jobs/:id
```

**Response:** `200 OK`



### Delete Job (Soft Delete)

```http
DELETE /api/v1/jobs/:id
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Job deleted successfully"
}
```



## 📰 News Endpoints

### Create News

```http
POST /api/v1/news
```

**Request Body:**
```json
{
  "title": "Tech Industry Sees 25% Growth in Q4",
  "summary": "The technology sector reported significant growth with over 50,000 new jobs created in the last quarter.",
  "sourceLink": "https://techcrunch.com/article"
}
```

**Response:** `201 Created`



### Get All News

```http
GET /api/v1/news?limit=20&page=1
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Items per page |
| `page` | number | 1 | Page number |

**Response:** `200 OK`



### Get Single News

```http
GET /api/v1/news/:id
```

**Response:** `200 OK`



### Delete News (Soft Delete)

```http
DELETE /api/v1/news/:id
```

**Response:** `200 OK`



## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origin whitelist
- **Input Validation**: Length and format checks
- **Soft Delete**: Data preservation with `isActive` flag



##  Data Normalization

### Company Names

Company names are automatically normalized:
- Stored in lowercase
- Trimmed of whitespace
- Example: `"Google"`, `"GOOGLE"`, `"google"` → all stored as `"google"`

This ensures consistent search and filtering.



## ⚡ Performance Optimizations

1. **Lean Queries**: Uses `.lean()` for 30-50% faster reads
2. **Database Indexes**: Optimized for common queries
3. **Pagination**: Efficient data loading
4. **Connection Pooling**: MongoDB connection reuse

---

## 🧪 Testing the API

### Using cURL

```bash
# Create a job
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer",
    "company": "Stripe",
    "location": "Remote",
    "applyLink": "https://stripe.com/jobs"
  }'

# Get all jobs
curl http://localhost:5000/api/v1/jobs

# Get jobs by company
curl http://localhost:5000/api/v1/jobs?company=stripe

# Get paginated results
curl http://localhost:5000/api/v1/jobs?limit=10&page=2
```

### Using Postman

Import the following collection:

```json
{
  "info": { "name": "ScrollJob API" },
  "item": [
    {
      "name": "Create Job",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/v1/jobs",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Backend Developer\",\n  \"company\": \"Stripe\",\n  \"location\": \"Remote\",\n  \"applyLink\": \"https://stripe.com/jobs\"\n}"
        }
      }
    }
  ]
}
```



## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.6.3",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```



## 🚢 Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy

### Deploy to Heroku

```bash
heroku create scrolljob-api
heroku config:set MONGO_URI=your_mongodb_uri
git push heroku main
```



## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

### Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```



## 📊 Database Schema

### Job Model

```javascript
{
  title: String,        // Required, max 200 chars
  company: String,      // Required, max 100 chars, lowercase
  location: String,     // Optional, max 100 chars, default: "Remote"
  applyLink: String,    // Required, must be valid URL
  isActive: Boolean,    // Default: true
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-generated
}
```

### JobNews Model

```javascript
{
  title: String,        // Required, max 300 chars
  summary: String,      // Required, max 1000 chars
  sourceLink: String,   // Optional, must be valid URL
  isActive: Boolean,    // Default: true
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-generated
}
```



## 🐛 Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `429` | Too Many Requests (rate limit) |
| `500` | Internal Server Error |



## 📈 Future Enhancements

- [ ] JWT authentication
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Job expiration dates
- [ ] Company logos
- [ ] Analytics endpoints



## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Author
Saurabh Rai



## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- Inspired by modern job platforms
- Follows REST API best practices



## 📞 Support

For support, email support@scrolljob.in or open an issue on GitHub.
