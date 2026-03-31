# Pulse Social

Production-ready social media web application built with React, Tailwind CSS, Axios, React Router, Node.js, Express, MongoDB, Mongoose, JWT authentication, bcrypt, Docker, and deployment-ready configuration.

## 1. Project Folder Structure

```text
.
|-- backend
|   |-- src
|   |   |-- config
|   |   |   |-- cloudinary.js
|   |   |   `-- db.js
|   |   |-- controllers
|   |   |   |-- authController.js
|   |   |   |-- commentController.js
|   |   |   |-- postController.js
|   |   |   `-- userController.js
|   |   |-- middleware
|   |   |   |-- auth.js
|   |   |   |-- errorHandler.js
|   |   |   |-- notFound.js
|   |   |   |-- upload.js
|   |   |   `-- validate.js
|   |   |-- models
|   |   |   |-- Comment.js
|   |   |   |-- Follow.js
|   |   |   |-- Notification.js
|   |   |   |-- Post.js
|   |   |   `-- User.js
|   |   |-- routes
|   |   |   |-- authRoutes.js
|   |   |   |-- commentRoutes.js
|   |   |   |-- postRoutes.js
|   |   |   `-- userRoutes.js
|   |   |-- utils
|   |   |   |-- ApiError.js
|   |   |   |-- asyncHandler.js
|   |   |   |-- imageUploader.js
|   |   |   |-- pagination.js
|   |   |   `-- token.js
|   |   |-- validations
|   |   |   |-- authValidation.js
|   |   |   |-- commentValidation.js
|   |   |   |-- postValidation.js
|   |   |   `-- userValidation.js
|   |   |-- app.js
|   |   `-- server.js
|   |-- tests
|   |   `-- auth.test.js
|   |-- .env.example
|   |-- Dockerfile
|   |-- jest.config.js
|   `-- package.json
|-- frontend
|   |-- src
|   |   |-- api
|   |   |   `-- client.js
|   |   |-- components
|   |   |   |-- layout
|   |   |   |   |-- AppShell.jsx
|   |   |   |   `-- ProtectedRoute.jsx
|   |   |   |-- posts
|   |   |   |   |-- CommentList.jsx
|   |   |   |   |-- PostCard.jsx
|   |   |   |   `-- PostComposer.jsx
|   |   |   |-- profile
|   |   |   |   `-- ProfileHeader.jsx
|   |   |   `-- search
|   |   |       `-- UserSearch.jsx
|   |   |-- context
|   |   |   `-- AuthContext.jsx
|   |   |-- hooks
|   |   |   `-- useInfiniteScroll.js
|   |   |-- pages
|   |   |   |-- HomePage.jsx
|   |   |   |-- LoginPage.jsx
|   |   |   |-- ProfilePage.jsx
|   |   |   `-- RegisterPage.jsx
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- Dockerfile
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- .gitignore
|-- docker-compose.yml
`-- README.md
```

## 2. Backend Overview

### Stack

- Express REST API
- MongoDB with Mongoose
- JWT authentication
- `bcrypt` password hashing
- `multer` for image uploads
- Optional Cloudinary integration
- Validation via `express-validator`
- Security middleware: `helmet`, `cors`, `express-mongo-sanitize`, `hpp`, `express-rate-limit`

### Core Features Implemented

- Register, login, logout, authenticated current user
- Profile view and profile editing with image upload
- Follow and unfollow users
- Home feed with pagination for infinite scroll
- User profile feed
- Create, edit, delete posts
- Like and unlike posts
- Comment create, list, delete
- Basic notifications for follow, like, comment
- User search

## 3. Database Schema Design

### User

Fields:

- `username` unique, indexed, lowercase
- `displayName`
- `email` unique, indexed
- `password` hashed with bcrypt and excluded by default from queries
- `bio`
- `profilePicture { url, publicId, storageType }`
- `followersCount`
- `followingCount`
- `postsCount`

Indexes:

- `username`
- `email`
- text index on `username`, `displayName`, `bio`

### Post

Fields:

- `author` reference to `User`
- `content`
- `image { url, publicId, storageType }`
- `likes` array of `User` references
- `likesCount`
- `commentsCount`

Indexes:

- `createdAt`
- compound index `{ author, createdAt }`

### Comment

Fields:

- `post` reference to `Post`
- `author` reference to `User`
- `content`

Indexes:

- compound index `{ post, createdAt }`

### Follow Relationship

Fields:

- `follower` reference to `User`
- `following` reference to `User`

Indexes:

- unique compound index `{ follower, following }`
- `{ following, createdAt }`
- `{ follower, createdAt }`

### Notification

Fields:

- `recipient`
- `actor`
- `type` (`follow`, `like`, `comment`)
- `post`
- `comment`
- `read`

Indexes:

- `{ recipient, read, createdAt }`

## 4. REST API Design

Base URL:

- Backend: `http://localhost:5000/api`

### `/api/auth`

#### `POST /api/auth/register`

Request:

```json
{
  "username": "alice",
  "displayName": "Alice Carter",
  "email": "alice@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "Account created successfully",
  "token": "jwt-token",
  "user": {
    "_id": "661234...",
    "username": "alice",
    "displayName": "Alice Carter",
    "email": "alice@example.com"
  }
}
```

#### `POST /api/auth/login`

Request:

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "message": "Authentication successful",
  "token": "jwt-token",
  "user": {
    "_id": "661234...",
    "username": "alice",
    "displayName": "Alice Carter"
  }
}
```

#### `GET /api/auth/me`

Headers:

- `Authorization: Bearer <jwt>`

Response:

```json
{
  "user": {
    "_id": "661234...",
    "username": "alice"
  },
  "unreadNotifications": 3
}
```

### `/api/users`

#### `GET /api/users/search?q=ali&page=1&limit=5`

Response:

```json
{
  "users": [
    {
      "_id": "661234...",
      "username": "alice",
      "displayName": "Alice Carter"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "hasMore": false
  }
}
```

#### `GET /api/users/:username`

Response:

```json
{
  "user": {
    "_id": "661234...",
    "username": "alice",
    "bio": "Building in public"
  },
  "isFollowing": true
}
```

#### `PATCH /api/users/me`

Content-Type:

- `multipart/form-data`

Fields:

- `username`
- `displayName`
- `bio`
- `profilePicture`

#### `POST /api/users/:userId/follow`

Response:

```json
{
  "message": "You are now following alice"
}
```

#### `DELETE /api/users/:userId/follow`

#### `GET /api/users/me/notifications`

#### `PATCH /api/users/me/notifications/read`

### `/api/posts`

#### `GET /api/posts/feed?page=1&limit=6`

Response:

```json
{
  "posts": [
    {
      "_id": "771234...",
      "content": "Hello Pulse",
      "likesCount": 2,
      "commentsCount": 1,
      "isLiked": false,
      "author": {
        "_id": "661234...",
        "username": "alice"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 12,
    "hasMore": true
  }
}
```

#### `GET /api/posts/user/:username?page=1&limit=6`

#### `GET /api/posts/:postId`

#### `POST /api/posts`

Content-Type:

- `multipart/form-data`

Fields:

- `content`
- `image`

#### `PATCH /api/posts/:postId`

#### `DELETE /api/posts/:postId`

#### `POST /api/posts/:postId/like`

Response:

```json
{
  "message": "Post liked",
  "post": {
    "_id": "771234...",
    "likesCount": 3,
    "isLiked": true
  }
}
```

### `/api/comments`

#### `GET /api/comments/post/:postId?page=1&limit=10`

#### `POST /api/comments`

Request:

```json
{
  "postId": "771234...",
  "content": "Great post!"
}
```

Response:

```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "881234...",
    "content": "Great post!"
  }
}
```

#### `DELETE /api/comments/:commentId`

## 5. Security Measures

- Passwords hashed with `bcrypt` in a Mongoose pre-save hook
- JWT validation middleware on protected routes
- Request validation with `express-validator`
- Mongo injection mitigation using `express-mongo-sanitize`
- HTTP headers hardened with `helmet`
- Request rate limiting on the API
- Parameter pollution protection with `hpp`
- Client routes protected with React route guards
- Sensitive values moved to `.env`

## 6. Frontend Overview

### Pages

- Login
- Register
- Home Feed
- Profile Page

### Frontend Architecture

- React hooks throughout
- Context API for authentication and app session state
- Axios API client with bearer token interceptor
- React Router for navigation
- Tailwind CSS for responsive styling
- Infinite scrolling via `IntersectionObserver`

## 7. Setup Instructions

### Local Development

1. Copy environment files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

2. Update `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social_media_app
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

3. Install dependencies:

```powershell
cd backend && npm install
cd ../frontend && npm install
```

4. Start MongoDB locally, or use MongoDB Atlas.

### Optional Cloudinary

Add these values to `backend/.env` to enable cloud storage:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

If Cloudinary is not configured, uploads are stored locally in `backend/uploads`.

## 8. Run Instructions

### Run Backend

```powershell
cd backend
npm run dev
```

### Run Frontend

```powershell
cd frontend
npm run dev
```

### Run Tests

```powershell
cd backend
npm test
```

### Run With Docker

1. Create `backend/.env` and `frontend/.env`.
2. Start all services:

```powershell
docker compose up --build
```

App URLs:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017`

## 9. Deployment Instructions

### Frontend on Vercel

1. Import the `frontend` folder as a Vercel project.
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add env var:
   - `VITE_API_URL=https://your-backend-domain/api`

### Backend on Render or Railway

1. Import the `backend` folder.
2. Set start command: `npm start`
3. Add environment variables from `backend/.env.example`.
4. Point `MONGODB_URI` to MongoDB Atlas.
5. Set `CLIENT_URL` to the deployed frontend URL.
6. Set `API_PUBLIC_URL` to the deployed backend URL.

### MongoDB Atlas

1. Create a cluster.
2. Create a database user.
3. Add your backend host to the IP allowlist.
4. Copy the Atlas connection string into `MONGODB_URI`.

## 10. Notes for Production Hardening

- Use Cloudinary in production instead of local file storage
- Add refresh tokens or token rotation if you need long-lived sessions
- Add structured logging and centralized monitoring
- Add background jobs for notification fanout if traffic grows
- Add Redis caching for popular feeds and search
- Add end-to-end tests for critical user journeys
