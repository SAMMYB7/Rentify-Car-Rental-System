# 🚗 **Car Rental System — Full Stack Application**

A production-style full-stack **Car Rental Management Platform** built using **React.js**, **Spring Boot**, **MySQL**, **JWT Security**, **Cloudinary**, **Razorpay**, and **AWS**.
The system supports user onboarding, car listings, bookings, payments, reviews, and admin management with secure, scalable backend APIs.

---

## 📌 **Table of Contents**

* [Overview](#overview)
* [Tech Stack](#tech-stack)
* [Features](#features)
* [Architecture](#architecture)
* [Database Schema](#database-schema)
* [API Documentation](#api-documentation)
* [Authentication Flow](#authentication-flow)
* [Project Setup](#project-setup)
* [Environment Variables](#environment-variables)
* [Future Enhancements](#future-enhancements)

---

## 🧾 **Overview**

The Car Rental System is a full-stack application designed to streamline the booking, management, and tracking of rental cars.
The backend is implemented in **Spring Boot** with layered architecture and **JWT-based authentication**. The frontend is built using **React.js**, providing a seamless client experience.

It includes integrations for:

* **Cloudinary** → Car image storage
* **Razorpay** → Secure payments
* **Email Services** → Booking confirmation & notifications
* **AWS** → Deployment & cloud infrastructure

---

## 🛠 **Tech Stack**

### **Frontend**

* React.js
* React Router
* Axios
* Tailwind CSS

### **Backend**

* Spring Boot
* Spring Security + JWT
* JPA / Hibernate
* MySQL
* Cloudinary SDK
* Razorpay Java SDK
* JavaMailSender
* Validation API

---

## ⭐ **Key Features**

### 👤 **User Features**

* User registration, login, password reset
* Browse and search cars
* Create and manage bookings
* Online payments (Razorpay)
* View past bookings
* Submit reviews

### 🛠 **Admin Features**

* Add, update, delete cars
* View all users
* View bookings & revenue summary
* Manage payments
* Monitor platform activity

### 🔒 **Security**

* JWT Authentication (Access + Refresh tokens)
* Password hashing (Spring Security Crypto)
* Role-based authorization (ADMIN / USER)
* Input validation & request sanitization

---

## 🏛 **Architecture**

```
Frontend (React)
       ↓
REST API Gateway
       ↓
Spring Boot (Controller → Service → Repository)
       ↓
MySQL Database
       ↓
External Integrations
   • Cloudinary (Images)
   • Razorpay (Payments)
   • JavaMail (Email)
```

The backend follows **clean layered architecture**:

* `controller`
* `service`
* `repository`
* `entities`
* `dto`
* `config` (SecurityConfig, JWTFilter, CORS, etc.)

---

## 🗄 **Database Schema (High-Level)**

The database schema defines the relational structure of the Car Rental System,
including users, cars, bookings, payments, reviews, and authentication tokens.

<p align="center">
  <img src="docs/er-diagram.png" alt="Car Rental System ER Diagram" width="850"/>
</p>


### Users

```
id, name, email, password, role, createdAt
```

### Cars

```
id, model, brand, type, imageUrl, pricePerDay, availability
```

### Bookings

```
id, userId, carId, startDate, endDate, totalPrice, paymentStatus
```

### Payments

```
id, bookingId, amount, method, status, transactionId
```

### Reviews

```
id, userId, carId, rating, comment
```

---

# 🔗 **API Documentation**

Below is the full list of APIs included in your project.

---

## 🚗 **Car APIs**

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/cars`        | Get all cars           |
| POST   | `/api/cars`        | Add new car (Admin)    |
| GET    | `/api/cars/{id}`   | Get car details        |
| PUT    | `/api/cars/{id}`   | Update car (Admin)     |
| DELETE | `/api/cars/{id}`   | Delete car (Admin)     |
| GET    | `/api/cars/search` | Search cars by filters |

---

## 📅 **Booking APIs**

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/bookings`      | Get all bookings (Admin) |
| POST   | `/api/bookings`      | Create booking           |
| GET    | `/api/bookings/my`   | Get user's bookings      |
| GET    | `/api/bookings/{id}` | Get booking              |
| PUT    | `/api/bookings/{id}` | Update booking           |
| DELETE | `/api/bookings/{id}` | Cancel booking           |

---

## 💳 **Payment APIs**

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/payments/all`                 | Admin: all payments       |
| GET    | `/api/payments/my`                  | User: my payments         |
| GET    | `/api/payments/booking/{bookingId}` | Get payment by booking    |
| POST   | `/api/payments/create`              | Create payment order      |
| POST   | `/api/payments/verify`              | Verify payment (Razorpay) |

---

## ⭐ **Review APIs**

| Method | Endpoint       | Description |
| ------ | -------------- | ----------- |
| GET    | `/api/reviews` | Get reviews |
| POST   | `/api/reviews` | Add review  |

---

## 👥 **User APIs**

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/api/users`          | Admin: all users         |
| GET    | `/api/users/me`       | Get current user profile |
| GET    | `/api/users/bookings` | User’s bookings          |
| GET    | `/api/users/summary`  | Admin: dashboard summary |

---

## 🔐 **Authentication APIs**

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| POST   | `/api/v1/auth/register`        | Register user        |
| POST   | `/api/v1/auth/login`           | Login                |
| POST   | `/api/v1/auth/forgot-password` | Send reset link      |
| POST   | `/api/v1/auth/reset-password`  | Reset password       |
| POST   | `/api/v1/admin/create`         | Create admin account |

---

## 🔑 **Authentication Flow**

1. User registers or logs in
2. Server issues **JWT Access Token**
3. All subsequent API requests require

   ```
   Authorization: Bearer <token>
   ```
4. Role-based authorization

   * USER → Bookings, Reviews, Payments
   * ADMIN → Car management, user management, summary

---

# ⚙️ **Project Setup**

### **Backend**

```bash
git clone <repo-url>
cd backend
mvn clean install
mvn spring-boot:run
```

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 **Environment Variables**

### Backend (`application.properties`)

```
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=

jwt.secret=
cloudinary.cloud_name=
cloudinary.api_key=
cloudinary.api_secret=
razorpay.key_id=
razorpay.key_secret=
spring.mail.username=
spring.mail.password=
```

---
