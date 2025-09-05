<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🛒 E-Commerce Learning Project

A **production-ready e-commerce backend** built with **NestJS, TypeORM, and MySQL**, designed as a complete learning journey from project setup to advanced features like caching, authentication, real-time notifications, and deployment.

---

## 🚀 Features

- Modular **NestJS architecture** with TypeORM integration
- **User management** with roles (customer, vendor, admin)
- **Products, categories, vendors, orders, cart** modules
- **Authentication & authorization** (session + redis, RBAC)
- **Validation & custom pipes** for data integrity
- **Database migrations** for schema versioning
- **Logging, monitoring, and API documentation**
- **File uploads** with image handling
- **Advanced e-commerce features** (cart, reviews, inventory)
- **Redis caching** and background jobs
- **Real-time notifications** (WebSockets)
- **Testing strategy** (unit + E2E with TypeORM)
- **Docker & Kubernetes deployment**

---

## 🛠️ Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** MySQL + [TypeORM](https://typeorm.io/)
- **Cache/Queues:** Redis
- **Authentication:** JWT + Refresh Tokens
- **Documentation:** Swagger / OpenAPI
- **Deployment:** Docker, Kubernetes

---

## 📂 Project Structure

```
ecommerce-platform/
├── src/
│   ├── auth/              # Authentication & authorization
│   ├── users/             # User management
│   ├── vendors/           # Vendor system
│   ├── products/          # Product catalog
│   ├── categories/        # Product categories
│   ├── orders/            # Orders & order items
│   ├── cart/              # Shopping cart
│   ├── payments/          # Payment integration
│   ├── reviews/           # Product reviews
│   ├── inventory/         # Inventory management
│   ├── notifications/     # Real-time notifications
│   ├── uploads/           # File uploads
│   ├── admin/             # Admin panel
│   ├── common/            # Shared utilities
│   ├── config/            # App configuration
│   └── database/          # TypeORM setup & migrations
├── migrations/            # Database migrations
├── test/                  # Unit & E2E tests
├── deployment/            # Docker/K8s deployment files
└── docs/                  # Documentation
```

---

## ⚙️ Setup & Installation

### 1. Clone repository

```bash
https://github.com/Ahmedali64/E-Commerce.git
cd ecommerce-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file based on `.env.example`:

### 4. Database setup

```bash
# Make sure you already have the database
CREATE DATABASE your_database_name

# Run migrations
npm run typeorm:migration:run
```
### 5. Make sure you have redus running on a container or local before you start

### 6. Start development server

```bash
npm run start:dev
```

Server runs on: [http://localhost:3000](http://localhost:3000)
---
## API Documentation
```bash 
http://localhost:3000/api/docs
```
or
Full API documentation (with example requests and responses) is available here:  
[View in Postman](https://documenter.getpostman.com/view/21578024/2sB3Hkq1Ga)

---

## 📖 Roadmap

This project follows a **learning-first roadmap**:

1. **Foundations** – NestJS setup, users module, TypeORM integration
2. **Logging & Docs** – Logging system, Swagger API docs, rate limiting
3. **API Design** – Categories, products, vendors modules
4. **Caching & Performance** – Redis caching, query optimization
5. **Security & Auth** – Session, roles & permissions
6. **File Management** – Secure file uploads, image handling
7. **Database Advanced** – Orders, cart, reviews, inventory
8. **Real-Time & Jobs** – WebSockets, background job queues
9. **Testing** – Unit & E2E with TypeORM
10. **Deployment** – Docker, Kubernetes, monitoring stack

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📜 License

MIT License – feel free to use this project as a learning resource or starter template.
