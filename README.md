# 🏨 Hotel Management System

A **full-stack Hotel Management System** built with **Spring Boot 3** (backend) and **React + Vite** (frontend).
The system enables hotel administrators to manage hotels, rooms, and bookings, while customers can browse, search, book rooms, and manage their reservations — all secured with **JWT-based Role-Based Access Control (RBAC)**.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [Security & JWT Flow](#-security--jwt-flow)
- [Validation & Exception Handling](#-validation--exception-handling)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Running Tests](#-running-tests)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [Frontend Pages](#-frontend-pages)
- [User Roles & Permissions](#-user-roles--permissions)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login with **JWT token-based authentication**
- **BCrypt password hashing** — passwords never stored as plain text
- **Role-Based Access Control (RBAC)** — ADMIN and CUSTOMER roles
- Stateless API — no server-side sessions
- JWT token valid for **24 hours**

### 🏨 Hotel Management *(ADMIN only)*
- Create, Read, Update, Delete hotels
- Upload and serve hotel images (up to 5 MB)
- Keyword search by hotel name or city
- Paginated listing with sorting (name, location, newest/oldest)

### 🛏️ Room Management *(ADMIN only)*
- Add rooms to any hotel with room number, type, and price
- Room types: `SINGLE`, `DOUBLE`, `SUITE`, `DELUXE`
- Real-time availability checking by date range
- Price stored as `BigDecimal` for precision (no rounding errors)

### 📅 Booking Management
- Live **date overlap detection** — prevents double-booking
- Automatic **price calculation** (number of nights × room price)
- **Pay-later** option with configurable advance payment
- View and cancel own bookings
- Admin can view all bookings across the system

### 🌐 Frontend
- Responsive React UI with Tailwind CSS
- Framer Motion animations
- Pagination + sorting on Hotels, Rooms, Bookings, and Admin views
- Admin Dashboard with hotel/room/booking management
- Customer portal — browse, search, book, and manage reservations

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 (LTS) | Core language |
| Spring Boot | 3.2.5 | Application framework |
| Spring Security | 6.2.4 | Authentication & authorization |
| Spring Data JPA | 3.2.5 | Database ORM layer |
| Hibernate ORM | 6.4.4 | JPA implementation |
| MySQL Connector/J | 8.3.0 | JDBC driver |
| jjwt (JJWT) | 0.11.5 | JWT generation & validation |
| Lombok | 1.18.34 | Boilerplate code reduction |
| Springdoc OpenAPI | 2.5.0 | Swagger UI & API documentation |
| Jakarta Validation | 3.0.2 | Input validation annotations |
| Maven | 3.x | Build & dependency management |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.6 | UI library |
| Vite | 8.0.12 | Build tool & dev server |
| React Router DOM | 7.18.0 | Client-side routing |
| Axios | 1.18.1 | HTTP client for API calls |
| Tailwind CSS | 4.3.1 | Utility-first CSS framework |
| Framer Motion | 12.40.0 | Animations & transitions |
| Lucide React | 1.21.0 | Icon library |

### Dev Tools
| Tool | Purpose |
|---|---|
| IntelliJ IDEA | Backend IDE |
| Postman | API testing |
| MySQL Workbench | Database management |
| JUnit 5 | Unit testing |
| Mockito | Mocking framework |
| MockMvc | Integration testing |

---

## 🏗️ System Architecture

The application follows a strict **Layered Architecture** — each layer has exactly one responsibility:

```
Client (Browser / Postman / Swagger UI)
              │
              ▼
   ┌─────────────────────┐
   │   JwtAuthFilter     │  ← Reads Authorization header, validates JWT
   │   (Security Layer)  │  ← Sets SecurityContextHolder
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │   SecurityConfig    │  ← Checks URL rules & role requirements
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Controller Layer   │  ← Receives HTTP request, validates @Valid
   │  @RestController    │  ← Calls service, returns ResponseEntity
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │   Service Layer     │  ← All business logic lives here
   │   @Transactional    │  ← Price calc, overlap check, role assignment
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Repository Layer   │  ← JpaRepository + custom JPQL / native queries
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │   MySQL Database    │  ← hotel_management_db
   │   (Hibernate ORM)   │
   └─────────────────────┘

← JSON Response flows back up through each layer →
   Repository → Mapper (Entity→DTO) → Controller → Client
```

### SOLID Principles Applied
- **S**ingle Responsibility — each class has one job (controller handles HTTP, service handles logic)
- **O**pen/Closed — new features added via new implementations, not by editing existing classes
- **D**ependency Inversion — controllers and services depend on interfaces, not concrete classes

---

## 📁 Project Structure

### Backend — `management/`
```
src/
└── main/
    ├── java/com/hotel/management/
    │   ├── ManagementApplication.java          ← Entry point (@SpringBootApplication)
    │   │
    │   ├── config/
    │   │   ├── SecurityConfig.java             ← JWT filter chain, URL rules, BCrypt bean
    │   │   ├── SwaggerConfig.java              ← OpenAPI metadata + Bearer auth scheme
    │   │   └── WebConfig.java                  ← CORS config + static file serving (/uploads/**)
    │   │
    │   ├── controller/
    │   │   ├── AuthController.java             ← POST /api/auth/register, /api/auth/login
    │   │   ├── HotelController.java            ← CRUD + search + image upload
    │   │   ├── RoomController.java             ← CRUD + availability check
    │   │   └── BookingController.java          ← Create, view, cancel bookings
    │   │
    │   ├── service/
    │   │   ├── AuthService.java                ← Interface
    │   │   ├── HotelService.java               ← Interface
    │   │   ├── RoomService.java                ← Interface
    │   │   ├── BookingService.java             ← Interface
    │   │   └── impl/
    │   │       ├── AuthServiceImpl.java        ← Register, login logic
    │   │       ├── HotelServiceImpl.java       ← Hotel business logic + image upload
    │   │       ├── RoomServiceImpl.java        ← Room management + availability
    │   │       └── BookingServiceImpl.java     ← Booking engine: overlap, price, pay-later
    │   │
    │   ├── repository/
    │   │   ├── UserRepository.java             ← findByEmail, existsByEmail, JOIN FETCH roles
    │   │   ├── RoleRepository.java             ← findByName(RoleName)
    │   │   ├── HotelRepository.java            ← searchHotels (JPQL), findByLocation
    │   │   ├── RoomRepository.java             ← findAvailableRoomsForDates (native SQL)
    │   │   └── BookingRepository.java          ← existsOverlappingBooking, findByUserId
    │   │
    │   ├── entity/
    │   │   ├── User.java                       ← users table (@ManyToMany roles)
    │   │   ├── Role.java                       ← roles table
    │   │   ├── Hotel.java                      ← hotels table (@OneToMany rooms)
    │   │   ├── Room.java                       ← rooms table (@ManyToOne hotel)
    │   │   └── Booking.java                    ← bookings table (@ManyToOne user, room)
    │   │
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── RegisterRequest.java        ← name, email, password, phone (validated)
    │   │   │   ├── LoginRequest.java           ← email, password
    │   │   │   ├── HotelRequest.java           ← name, location, description
    │   │   │   ├── RoomRequest.java            ← hotelId, roomNumber, type, price
    │   │   │   └── BookingRequest.java         ← roomId, checkIn, checkOut, payLater
    │   │   └── response/
    │   │       ├── AuthResponse.java           ← token, tokenType, id, name, email, roles
    │   │       ├── UserResponse.java           ← id, name, email, phone, roles (no password)
    │   │       ├── HotelResponse.java          ← id, name, location, description, imageUrl
    │   │       ├── RoomResponse.java           ← id, hotelId, hotelName, type, price, available
    │   │       ├── BookingResponse.java        ← full booking details across 3 entities
    │   │       └── PageResponse.java           ← Generic<T> with pagination metadata
    │   │
    │   ├── mapper/
    │   │   ├── UserMapper.java                 ← User entity → UserResponse DTO
    │   │   ├── HotelMapper.java                ← HotelRequest → Hotel entity, Hotel → HotelResponse
    │   │   ├── RoomMapper.java                 ← Room entity → RoomResponse DTO
    │   │   └── BookingMapper.java              ← Booking entity → BookingResponse DTO
    │   │
    │   ├── exception/
    │   │   ├── ResourceNotFoundException.java  ← 404 — entity not found by ID/email
    │   │   ├── DuplicateResourceException.java ← 409 — email already registered
    │   │   ├── BadRequestException.java        ← 400 — invalid dates, overlap, cancelled
    │   │   └── GlobalExceptionHandler.java     ← @RestControllerAdvice — catches all exceptions
    │   │
    │   ├── security/
    │   │   ├── JwtUtil.java                    ← generateToken, validateToken, extractUsername
    │   │   ├── JwtAuthFilter.java              ← OncePerRequestFilter — validates JWT on every request
    │   │   └── CustomUserDetailsService.java   ← Loads user from DB for Spring Security
    │   │
    │   └── enums/
    │       ├── RoleName.java                   ← ADMIN, CUSTOMER
    │       ├── RoomType.java                   ← SINGLE, DOUBLE, SUITE, DELUXE
    │       └── BookingStatus.java              ← PENDING, CONFIRMED, CANCELLED
    │
    └── resources/
        └── application.properties              ← DB, JWT, file upload, server config
```

### Frontend — `meridian-stay-js/`
```
src/
├── main.jsx                        ← React entry point
├── App.jsx                         ← Routes definition
├── index.css                       ← Global styles
│
├── api/
│   ├── client.js                   ← Axios instance (baseURL: localhost:9010/api) + token helpers
│   ├── auth.js                     ← register(), login() API calls
│   ├── hotels.js                   ← getAll(), getById(), create(), update(), remove(), search(), uploadImage()
│   ├── rooms.js                    ← getAll(), getAvailable(), create(), update(), remove()
│   └── bookings.js                 ← getMine(), getAll(), create(), cancel()
│
├── context/
│   ├── AuthContext.jsx             ← Global auth state (user, token, login, logout)
│   └── useAuth.js                  ← useContext(AuthContext) hook
│
├── pages/
│   ├── Home.jsx                    ← Landing page
│   ├── Rooms.jsx                   ← Hotels listing with search, sort, pagination
│   ├── HotelDetail.jsx             ← Hotel info + room list + book button
│   ├── BookingPage.jsx             ← Booking form (dates, pay-later option)
│   ├── MyBookings.jsx              ← Customer bookings with sort + pagination + cancel
│   ├── AdminDashboard.jsx          ← Admin panel (tabs: Overview, Hotels, Rooms, Bookings)
│   ├── Login.jsx                   ← Login form
│   ├── Signup.jsx                  ← Registration form
│   └── NotFound.jsx                ← 404 page
│
├── components/
│   ├── Navbar.jsx                  ← Navigation bar with auth state
│   ├── Footer.jsx                  ← Footer
│   ├── ProtectedRoute.jsx          ← Route guard (redirects if not authenticated/authorized)
│   ├── LoadingSpinner.jsx          ← Loading indicator
│   ├── EmptyState.jsx              ← Empty list placeholder
│   ├── Banner.jsx                  ← Success/error banner
│   ├── Modal.jsx                   ← Reusable modal dialog
│   └── admin/
│       ├── AdminOverview.jsx       ← Stats cards (hotels, rooms, bookings count)
│       ├── AdminHotels.jsx         ← Hotel CRUD + image upload + sort + pagination
│       ├── AdminRooms.jsx          ← Room CRUD + hotel filter + sort + pagination
│       └── AdminBookings.jsx       ← Bookings table + sort + pagination
│
└── lib/
    └── format.js                   ← formatCurrency, formatDate, nightsBetween, hotelImage helpers
```

---

## 🗄️ Database Design

**Database:** `hotel_management_db` (MySQL 8)
**DDL:** Managed automatically by Hibernate (`ddl-auto=update`)

### Tables

```
┌──────────────────────────────────────┐
│               users                  │
├──────────────────────────────────────┤
│ id           BIGINT  PK AUTO_INC     │
│ name         VARCHAR(100) NOT NULL   │
│ email        VARCHAR(150) UNIQUE NN  │
│ password     VARCHAR(255) NOT NULL   │  ← BCrypt hash
│ phone        VARCHAR(15)             │
│ created_at   DATETIME NOT NULL       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│               roles                  │
├──────────────────────────────────────┤
│ id           BIGINT  PK AUTO_INC     │
│ name         VARCHAR(255) UNIQUE     │  ← ADMIN | CUSTOMER
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│            user_roles  (join table)  │
├──────────────────────────────────────┤
│ user_id      BIGINT FK → users.id    │
│ role_id      BIGINT FK → roles.id    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│               hotels                 │
├──────────────────────────────────────┤
│ id           BIGINT  PK AUTO_INC     │
│ name         VARCHAR(150) NOT NULL   │
│ location     VARCHAR(200) NOT NULL   │
│ description  LONGTEXT                │
│ image_url    VARCHAR(500)            │
│ created_at   DATETIME NOT NULL       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│               rooms                  │
├──────────────────────────────────────┤
│ id           BIGINT  PK AUTO_INC     │
│ hotel_id     BIGINT FK → hotels.id   │
│ room_number  VARCHAR(10) NOT NULL    │
│ type         VARCHAR(255)            │  ← SINGLE|DOUBLE|SUITE|DELUXE
│ price        DECIMAL(10,2) NOT NULL  │  ← BigDecimal precision
│ available    BIT(1)                  │
│ created_at   DATETIME NOT NULL       │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│             bookings                 │
├──────────────────────────────────────┤
│ id             BIGINT PK AUTO_INC    │
│ user_id        BIGINT FK → users.id  │
│ room_id        BIGINT FK → rooms.id  │
│ check_in       DATE NOT NULL         │
│ check_out      DATE NOT NULL         │
│ total_price    DECIMAL(10,2)         │
│ advance_paid   DECIMAL(10,2)         │
│ remaining_amt  DECIMAL(10,2)         │
│ pay_later      BIT(1)                │
│ status         VARCHAR(255)          │  ← PENDING|CONFIRMED|CANCELLED
│ created_at     DATETIME NOT NULL     │
└──────────────────────────────────────┘
```

### Relationships
| Relationship | Type | Description |
|---|---|---|
| User ↔ Role | Many-to-Many | Bridge table `user_roles`, auto-generated by JPA |
| Hotel → Room | One-to-Many | `CascadeType.ALL` — deleting hotel deletes its rooms |
| Room → Booking | One-to-Many | One room can have many bookings on different dates |
| User → Booking | One-to-Many | One user can have many bookings |

### Seed Required Data
Before using the system, seed the roles table:
```sql
CREATE DATABASE hotel_management_db;
USE hotel_management_db;

INSERT INTO roles (name) VALUES ('ADMIN');
INSERT INTO roles (name) VALUES ('CUSTOMER');
```

---

## 🌐 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (gets CUSTOMER role) | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |

### 🏨 Hotels
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/hotels` | Get all hotels (paginated + sortable) | Public |
| `GET` | `/api/hotels/{id}` | Get hotel by ID | Public |
| `GET` | `/api/hotels/search?keyword=` | Search hotels by name or city | Public |
| `POST` | `/api/hotels` | Create a new hotel | ADMIN |
| `PUT` | `/api/hotels/{id}` | Update hotel details | ADMIN |
| `DELETE` | `/api/hotels/{id}` | Delete hotel (cascades to rooms) | ADMIN |
| `POST` | `/api/hotels/{id}/image` | Upload hotel image (multipart/form-data) | ADMIN |

**Pagination & Sort params for `GET /api/hotels`:**
```
?page=0&size=10&sortBy=name&sortDir=asc
sortBy options:  id | name | location | createdAt
sortDir options: asc | desc
```

### 🛏️ Rooms
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/rooms` | Get all rooms (paginated) | Public |
| `GET` | `/api/rooms/{id}` | Get room by ID | Public |
| `GET` | `/api/rooms/available` | Get available rooms by hotel & dates | Public |
| `POST` | `/api/rooms` | Create a new room | ADMIN |
| `PUT` | `/api/rooms/{id}` | Update room details | ADMIN |
| `DELETE` | `/api/rooms/{id}` | Delete room | ADMIN |

**Availability check params:**
```
GET /api/rooms/available?hotelId=1&checkIn=2026-08-01&checkOut=2026-08-03
```

### 📅 Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/bookings` | Create a new booking | Any logged-in user |
| `GET` | `/api/bookings` | Get all bookings (paginated) | ADMIN |
| `GET` | `/api/bookings/{id}` | Get booking by ID | ADMIN / Owner |
| `GET` | `/api/bookings/my` | Get my bookings (paginated) | Any logged-in user |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking | Any logged-in user |

### Sample Request Bodies

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "pass123",
  "phone": "9876543210"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "pass123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["CUSTOMER"]
}
```

**Create Booking:**
```json
POST /api/bookings
Authorization: Bearer <token>
{
  "roomId": 1,
  "checkIn": "2026-08-01",
  "checkOut": "2026-08-03",
  "payLater": false
}
```
**Response:**
```json
{
  "id": 1,
  "userName": "John Doe",
  "hotelName": "The Grand Palace",
  "roomNumber": "101",
  "roomType": "DELUXE",
  "checkIn": "2026-08-01",
  "checkOut": "2026-08-03",
  "totalPrice": 10000.00,
  "status": "CONFIRMED"
}
```

---

## 🔐 Security & JWT Flow

### Login Flow
```
1. POST /api/auth/login  { email, password }
2. AuthenticationManager.authenticate()
3. BCrypt.matches(rawPassword, storedHash)
4. JWT generated: { sub: email, roles: [...], iat: now, exp: now+24h }
5. Token returned to client
```

### Every Protected Request
```
1. Client sends:  Authorization: Bearer eyJhbGci...
2. JwtAuthFilter intercepts request (runs before every controller)
3. JWT signature + expiry validated
4. User identity (email) extracted from token
5. User loaded from DB by email
6. SecurityContextHolder updated with authentication
7. SecurityConfig checks URL rule + required role
8. ✅ Request reaches controller  OR  ❌ 403 Forbidden returned
```

### JWT Token Structure
```
eyJhbGciOiJIUzI1NiJ9          ← Header  (algorithm: HS256)
.eyJzdWIiOiJ1c2VyQGUuY29tIiw  ← Payload (email, roles, iat, exp)
.SflKxwRJSMeKKF2QT4fwpMeJf36  ← Signature (HMAC-SHA256 with secret key)
```

### Security Configuration (URL Rules)
```
/uploads/**              → Public   (hotel images)
/api/auth/**             → Public   (register & login)
GET /api/hotels/**       → Public
GET /api/rooms/**        → Public
POST /api/hotels/**      → ADMIN only
PUT  /api/hotels/**      → ADMIN only
DELETE /api/hotels/**    → ADMIN only
POST /api/rooms/**       → ADMIN only
PUT  /api/rooms/**       → ADMIN only
DELETE /api/rooms/**     → ADMIN only
/api/users/**            → ADMIN only
/api/bookings/**         → Authenticated
/swagger-ui/**           → Public (dev only)
```

---

## ✅ Validation & Exception Handling

### Input Validation (Jakarta Validation)
Applied on all request DTOs. Activated by `@Valid` in controllers.

| Annotation | Used In | What It Validates |
|---|---|---|
| `@NotBlank` | `RegisterRequest`, `LoginRequest`, `HotelRequest`, `RoomRequest` | Not null, not empty, not whitespace-only |
| `@Email` | `RegisterRequest`, `LoginRequest` | Valid email format (contains `@` and domain) |
| `@Size(min, max)` | `RegisterRequest`, `HotelRequest` | String length between min and max characters |
| `@Pattern(regexp)` | `RegisterRequest` | Phone: exactly 10 digits `^[0-9]{10}$` |
| `@NotNull` | `BookingRequest`, `RoomRequest` | Field cannot be null (for non-String types) |
| `@FutureOrPresent` | `BookingRequest.checkIn` | Date is today or a future date |
| `@Future` | `BookingRequest.checkOut` | Date is strictly in the future |
| `@DecimalMin` | `BookingRequest`, `RoomRequest` | Price / advance must be greater than 0 |

### Custom Exceptions
| Exception | HTTP Code | When Thrown |
|---|---|---|
| `ResourceNotFoundException` | `404 Not Found` | Hotel, Room, Booking, or User not found by ID/email |
| `DuplicateResourceException` | `409 Conflict` | Trying to register with an already-used email |
| `BadRequestException` | `400 Bad Request` | Invalid dates, booking overlap, already cancelled, advance > total |
| `MethodArgumentNotValidException` | `400 Bad Request` | `@Valid` annotation fails on any DTO field |
| `Exception` (generic) | `500 Internal Server Error` | Any unexpected runtime error |

### Error Response Format
All errors return a consistent JSON structure:
```json
{
  "timestamp": "2026-06-21T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Hotel not found with id: 99"
}
```

Validation errors include field-level details:
```json
{
  "timestamp": "2026-06-21T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "fieldErrors": {
    "email": "Please provide a valid email address",
    "password": "Password must be between 6 and 20 characters"
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- **Java 17** (LTS) — [Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- **Maven 3.x** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Clone the Repository
```bash
git clone https://github.com/your-username/hotel-management-system.git
cd hotel-management-system
```

---

## ⚙️ Environment Configuration

### Backend — `application.properties`

Open `management/src/main/resources/application.properties` and update:

```properties
# Server
server.port=9010

# Database — update with your MySQL credentials
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_management_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# JWT — change this secret in production!
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
app.file.upload-dir=uploads/hotels
```

> ⚠️ **Security Note:** Never commit real passwords or JWT secrets to a public repository. Use environment variables in production:
> ```properties
> spring.datasource.password=${DB_PASSWORD}
> app.jwt.secret=${JWT_SECRET}
> ```

### Frontend — API Base URL

The frontend connects to the backend at `http://localhost:9010/api`.
To change this, update `meridian-stay-js/src/api/client.js`:

```js
export const api = axios.create({
  baseURL: 'http://localhost:9010/api',
});
```

---

## ▶️ Running the Application

### Step 1: Create the MySQL Database
```sql
CREATE DATABASE hotel_management_db;
USE hotel_management_db;
```

### Step 2: Start the Backend
```bash
cd management
mvn clean install
mvn spring-boot:run
```

**Expected output:**
```
Tomcat started on port(s): 9010 (http)
Started ManagementApplication in X.XXX seconds
```

### Step 3: Seed the Roles Table
After the app starts (it creates the tables automatically), run:
```sql
USE hotel_management_db;
INSERT INTO roles (name) VALUES ('ADMIN');
INSERT INTO roles (name) VALUES ('CUSTOMER');
```

### Step 4: Create an Admin User
Register a user via API:
```bash
curl -X POST http://localhost:9010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@hotel.com","password":"admin123","phone":"9876543210"}'
```

Then assign the ADMIN role in MySQL:
```sql
-- Find the user ID
SELECT id FROM users WHERE email = 'admin@hotel.com';

-- Assign ADMIN role (assuming user_id=1, admin role_id=1)
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
```

### Step 5: Start the Frontend
```bash
cd meridian-stay-js
npm install
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 🧪 Running Tests

```bash
cd management

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=HotelServiceImplTest
mvn test -Dtest=BookingServiceImplTest
mvn test -Dtest=AuthControllerIntegrationTest
```

### Test Coverage

| Test Class | Type | Tests | What It Covers |
|---|---|---|---|
| `ManagementApplicationTests` | Context | 1 | Spring context loads without errors |
| `HotelServiceImplTest` | Unit (Mockito) | 5 | Create, Get by ID (found + not found), Delete (found + not found) |
| `BookingServiceImplTest` | Unit (Mockito) | 3 | Invalid dates, room overlap, cancel booking |
| `AuthControllerIntegrationTest` | Integration (MockMvc) | 2 | POST /register → 201, POST /register (bad email) → 400 |

**Total: 11 tests · 0 failures · 0 errors**

### Test Technologies
- **JUnit 5** — test framework
- **Mockito** — `@Mock`, `@InjectMocks`, `when().thenReturn()`, `verify()`
- **AssertJ** — fluent assertions (`assertThat`, `assertThatThrownBy`)
- **MockMvc** — simulates HTTP requests without starting a real server
- **@SpringBootTest** — loads full Spring application context for integration tests

---

## 📖 API Documentation (Swagger)

The project includes **Springdoc OpenAPI** for live, interactive API documentation.

**URL:** `http://localhost:9010/swagger-ui/index.html`

### How to Use Swagger UI

1. Start the backend (`mvn spring-boot:run`)
2. Open `http://localhost:9010/swagger-ui/index.html` in your browser
3. Click the **Authorize** button (🔒 icon, top right)
4. Login first via `POST /api/auth/login` in the auth-controller section
5. Copy the `token` value from the response
6. Paste it into the Authorize dialog (without the `Bearer ` prefix)
7. Click **Authorize** → **Close**
8. All endpoints now send your JWT token automatically
9. Expand any endpoint → **Try it out** → fill fields → **Execute**

### Swagger Features
- All endpoints grouped by controller (`Authentication`, `Hotel Management`, `room-controller`, `booking-controller`)
- Request body schemas with field descriptions
- Response schemas auto-generated from DTOs
- `@Tag` and `@Operation` annotations for human-readable descriptions
- Bearer JWT authentication scheme built in

---

## 🖥️ Frontend Pages

| Page | Route | Access | Description |
|---|---|---|---|
| Home | `/` | Public | Landing page with hero section |
| Browse Hotels | `/rooms` | Public | Hotel listing with search, sort, pagination |
| Hotel Detail | `/hotels/:id` | Public | Hotel info + available rooms by date |
| Book Room | `/book/:roomId` | Login required | Booking form with pay-later option |
| My Bookings | `/my-bookings` | Login required | View + cancel own bookings (paginated + sortable) |
| Login | `/login` | Public | Email + password login |
| Signup | `/signup` | Public | Registration form |
| Admin Dashboard | `/admin` | ADMIN only | Manage hotels, rooms, and all bookings |
| Not Found | `*` | Public | 404 error page |

---

## 👤 User Roles & Permissions

### ADMIN
| Action | Endpoint | Allowed |
|---|---|---|
| Create / Edit / Delete hotels | `POST/PUT/DELETE /api/hotels` | ✅ |
| Upload hotel images | `POST /api/hotels/{id}/image` | ✅ |
| Create / Edit / Delete rooms | `POST/PUT/DELETE /api/rooms` | ✅ |
| View ALL bookings | `GET /api/bookings` | ✅ |
| Manage user accounts | `GET/PUT/DELETE /api/users` | ✅ |
| Browse hotels & rooms | `GET /api/hotels`, `GET /api/rooms` | ✅ |
| Create / cancel bookings | `POST /api/bookings`, `/cancel` | ✅ |

### CUSTOMER
| Action | Endpoint | Allowed |
|---|---|---|
| Browse hotels & rooms | `GET /api/hotels`, `GET /api/rooms` | ✅ |
| Check room availability | `GET /api/rooms/available` | ✅ |
| Create a booking | `POST /api/bookings` | ✅ |
| View own bookings | `GET /api/bookings/my` | ✅ |
| Cancel own booking | `PUT /api/bookings/{id}/cancel` | ✅ |
| View all bookings | `GET /api/bookings` | ❌ |
| Create / edit / delete hotels or rooms | `POST/PUT/DELETE /api/hotels` | ❌ |
| Access admin dashboard | `/admin` | ❌ |

> **Role Assignment:** New registrations always receive the `CUSTOMER` role automatically.
> The `ADMIN` role must be assigned manually via database `INSERT INTO user_roles`.

---

## 🔧 Business Rules

1. **Booking Dates:** Check-out must be strictly after check-in
2. **Double-Booking Prevention:** The system uses a native SQL overlap query:
   ```sql
   WHERE check_in < :newCheckOut AND check_out > :newCheckIn
   ```
   If any non-cancelled booking overlaps the requested dates, the booking is rejected
3. **Price Calculation:** `totalPrice = numberOfNights × room.price`
4. **Pay Later:** Customer can pay an advance amount upfront and settle the rest at check-in. The remaining amount is calculated and stored automatically
5. **Cancel Restriction:** An already-cancelled booking cannot be cancelled again
6. **Role Immutability in Token:** JWT tokens are immutable snapshots — role changes in DB only take effect after the user re-logs in
7. **Password Security:** Passwords are hashed with BCrypt (adaptive cost factor) and never stored or returned as plain text
8. **Image Storage:** Hotel images are stored in `uploads/hotels/` folder on disk, with a UUID-prefixed filename to prevent collisions. The file path is stored in the database

---

## 🐛 Known Issues & Notes

- ADMIN role must be assigned manually via SQL after registration (no admin registration endpoint for security reasons)
- The `uploads/` folder must be created automatically on first image upload; ensure the application has write permissions to its working directory
- JWT tokens issued before a role change remain valid until expiry — users must re-login after role updates
- The `@Future` annotation on `checkOut` means you cannot book with today as checkout — always pick a future date

---

## 📂 How to Import in IntelliJ IDEA

1. Open IntelliJ IDEA
2. `File → Open` → Select the `management` folder (backend)
3. IntelliJ detects Maven project automatically → click **Trust Project**
4. Wait for Maven to download all dependencies (~2-3 min first time)
5. Go to `File → Project Structure → Project → SDK` → Select **Java 17**
6. Enable Lombok: `File → Settings → Plugins` → Install **Lombok** plugin
7. Enable annotation processing: `File → Settings → Build, Execution, Deployment → Compiler → Annotation Processors` → ✅ Enable
8. Run `ManagementApplication.java`

---

## 🤝 Contributing

This is an internship training project. If you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is built for educational purposes during internship training.
Feel free to use it as a learning reference.

---

## 👨‍💻 Author

**Yashasree**
- Internship Training Project
- Full-Stack Java & React Developer (in training)
- Built with: Spring Boot 3 · React 19 · MySQL · JWT · Swagger

---

*Hotel Management System — Built from scratch as part of internship training.*
*Every layer, every feature, every bug — debugged and understood.*
