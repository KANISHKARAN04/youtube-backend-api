# VIDTUBE Backend API

A scalable **YouTube-style backend service** built with **Node.js, Express, and MongoDB**.
This project provides RESTful APIs for video sharing platforms, including **authentication, video management, comments, likes, playlists, subscriptions, and creator dashboards**.

The architecture follows a **modular MVC structure** with reusable utilities, secure authentication, and optimized MongoDB queries.

---

# Features

### Authentication & Users

* User registration and login
* JWT-based authentication (Access & Refresh Tokens)
* Avatar and cover image upload
* Profile management
* Secure password handling

### Video Management

* Upload and publish videos
* Update and delete videos
* Video view tracking
* Thumbnail support
* Publish/unpublish videos

### Comments System

* Add comments to videos
* Edit and delete comments
* Reply to comments (nested comment structure)
* Fetch comments with user details

### Likes System

* Like and unlike:

  * Videos
  * Comments
  * Tweets
* Single scalable like model using dynamic references
* Prevent duplicate likes using compound indexing

### Subscriptions

* Subscribe / Unsubscribe to channels
* Fetch channel subscribers
* Fetch subscribed channels

### Playlists

* Create playlists
* Add videos to playlists
* Remove videos from playlists
* Update and delete playlists
* Fetch playlist videos

### Tweets

* Post short text updates (similar to community posts)
* Update and delete tweets
* Fetch tweet count

### Creator Dashboard

* Total videos
* Total views
* Total likes
* Total comments
* Total subscribers
* Creator video list

### Health Monitoring

* Healthcheck endpoint for uptime monitoring

---

# Tech Stack

Backend Framework

* Node.js
* Express.js

Database

* MongoDB
* Mongoose ODM

Authentication

* JWT (JSON Web Tokens)

File Storage

* Cloudinary (image & video uploads)

Other Tools

* Multer (file uploads)
* Bcrypt (password hashing)
* Custom API response and error handling utilities

---

# Project Structure

```
src
│
├── controllers
│   ├── user.controllers.js
│   ├── video.controllers.js
│   ├── comment.controllers.js
│   ├── like.controllers.js
│   ├── playlist.controllers.js
│   ├── subscription.controllers.js
│   ├── tweet.controllers.js
│   ├── dashboard.controllers.js
│   └── healthcheck.controllers.js
│
├── models
│   ├── user.models.js
│   ├── video.models.js
│   ├── comment.models.js
│   ├── like.models.js
│   ├── playlist.models.js
│   ├── subscription.models.js
│   └── tweet.models.js
│
├── routes
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── tweet.routes.js
│   ├── dashboard.routes.js
│   └── healthcheck.routes.js
│
├── middlewares
│   ├── auth.middleware.js
│   └── multer.middleware.js
│
├── utils
│   ├── api-error.js
│   ├── api-response.js
│   ├── asynchandler.js
│   └── cloudinary.js
│
├── validators
├── db
│
├── app.js
└── index.js
```

---

# Installation

Clone the repository

```
git clone https://github.com/YOUR_USERNAME/vidtube-backend.git
```

Navigate to the project directory

```
cd vidtube-backend
```

Install dependencies

```
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory.

Example configuration:

```
PORT=8000

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# Running the Server

Development mode

```
npm run dev
```

Production mode

```
npm start
```

Server runs at

```
http://localhost:8000
```

---

# API Modules

The backend exposes RESTful APIs for the following modules:

| Module        | Description                           |
| ------------- | ------------------------------------- |
| Users         | Authentication and profile management |
| Videos        | Video upload, publish, delete         |
| Comments      | Video comments and replies            |
| Likes         | Like videos, comments, tweets         |
| Subscriptions | Channel subscriptions                 |
| Playlists     | Video playlist management             |
| Tweets        | Short community posts                 |
| Dashboard     | Creator analytics                     |
| Healthcheck   | Server monitoring                     |

---

# Database Design

Main collections used:

* Users
* Videos
* Comments
* Likes
* Subscriptions
* Playlists
* Tweets

Optimizations include:

* Compound indexing for likes
* Aggregation pipelines for analytics
* Reference-based relationships between entities

---

# Security Features

* JWT Authentication
* Secure password hashing using bcrypt
* Protected routes with middleware
* Duplicate like prevention using MongoDB index
* Input validation and error handling

---

# Future Improvements

* Video recommendation system
* Watch history
* Notification system
* Video streaming optimization
* Redis caching for performance
* Rate limiting for API protection

---

# Author
KANISHKARAN K
Developed as a **backend engineering project** demonstrating scalable API architecture using Node.js and MongoDB.

---

# License

This project is licensed under the ISC License.
