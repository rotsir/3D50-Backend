# 3D50 Digital Marketplace

A full-stack digital product marketplace built with **HTML, CSS, JavaScript, Node.js, and SQL**.
This platform allows users to browse, search, review, and securely download digital products while providing a powerful admin panel for managing products, users, reviews, and discounts.

---

# Project Overview

3D50 Digital Marketplace is a scalable marketplace system designed to manage thousands of digital products such as 3D assets, files, or downloadable resources. The system includes a complete frontend storefront, secure REST API backend, and an advanced admin dashboard.

This project demonstrates full-stack development, REST API design, authentication systems, and scalable architecture.

---

# Features

## User Features

* Product browsing system
* Advanced product search and filters
* Product categories and tags
* Product reviews and ratings
* Secure digital downloads
* User registration and login
* Profile management
* Download history
* Responsive modern UI

## Admin Features

* Admin dashboard with statistics
* Product management (Add/Edit/Delete)
* Bulk product handling support
* Review moderation system
* User management
* Discount management
* Category management
* Analytics overview

## System Features

* REST API architecture
* JWT authentication
* Secure file download system
* Scalable database design
* Pagination for large datasets
* Protected storage system
* Environment based configuration

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Responsive Design

## Backend

* Node.js
* Express.js
* REST API Architecture
* JWT Authentication

## Database

* MySQL / PostgreSQL (configurable)

## Storage

* Local secure storage (production can use cloud storage)

## Dev Tools

* Git
* GitHub
* Postman
* PM2 (production ready)

---

# Project Structure

```
3D50/

frontend/          → Public website UI
admin/             → Admin dashboard
backend/           → API server
database/          → Schema and seed files
storage/           → Product assets
docs/              → Documentation

README.md
package.json
.env.example
.gitignore
```

---

# Installation Guide

## Clone repository

```
git clone https://github.com/rotsir/3D50.git
```

## Install backend dependencies

```
npm install
```

## Setup environment variables

Create:

```
.env
```

Example:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=marketplace
JWT_SECRET=your_secret_key
```

## Setup database

Import:

```
database/schema.sql
database/seed.sql
```

## Start server

```
npm start
```

or:

```
node backend/server.js
```

Server runs on:

```
http://localhost:5000
```

---

# API Structure

## Public APIs

```
GET /api/products
GET /api/products/:id
GET /api/categories
GET /api/search
```

## Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

## Reviews

```
POST /api/reviews
PUT /api/reviews
DELETE /api/reviews
```

## Admin APIs

```
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products
DELETE /api/admin/products

GET /api/admin/reviews
DELETE /api/admin/reviews
```

---

# Security Features

* Password hashing
* JWT authentication
* Protected admin routes
* Input validation
* SQL injection prevention
* Secure file access
* Environment variable protection

---

# Future Improvements

* Payment gateway integration
* Cloud storage integration
* CDN file delivery
* Email verification
* Wishlist system
* Advanced analytics
* Multi admin roles
* Docker deployment

---

# Deployment Plan

Frontend:
Vercel or Netlify

Backend:
Render or Railway

Database:
Supabase or MySQL hosting

Storage:
Firebase Storage or Supabase Storage

---

# Author

**Tanees Ahmad**

Full Stack Developer
University of Lahore

---

# License

This project is licensed under the MIT License.

---

# Notes

This project is built for learning purposes, portfolio demonstration, and scalable marketplace architecture practice.

---

# Contribution

Contributions, suggestions, and improvements are welcome.

---

# Version

Version 1.0 – Initial Full Stack Marketplace Release
