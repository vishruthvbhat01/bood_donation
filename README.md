# 🩸 BloodLink — Blood Donation Management System

A full-stack DBMS mini-project built with **MongoDB + Node.js + Express + HTML/CSS/JS**

---

## 📁 Project Structure

```
blood-donation/
├── backend/
│   ├── models/
│   │   ├── Donor.js          → Donor schema (MongoDB)
│   │   ├── BloodRequest.js   → Blood request schema
│   │   └── BloodStock.js     → Blood stock schema
│   ├── routes/
│   │   ├── donors.js         → Donor CRUD API
│   │   ├── requests.js       → Blood request API
│   │   ├── stock.js          → Blood stock API
│   │   └── admin.js          → Dashboard stats API
│   ├── server.js             → Express server entry point
│   ├── seed.js               → Sample data seeder
│   ├── .env.example          → Environment variables template
│   └── package.json
└── frontend/
    ├── index.html            → Main HTML page (SPA)
    ├── css/
    │   └── style.css         → Complete stylesheet
    └── js/
        ├── api.js            → API helper functions
        └── app.js            → Frontend app & routing
```

---

## 🚀 How to Run

### Prerequisites
- Node.js (v16+)
- MongoDB running locally OR MongoDB Atlas URI

### Step 1 — Install Dependencies
```bash
cd backend
npm install
```

### Step 2 — Setup Environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI
```

**Default `.env`:**
```
MONGO_URI=mongodb://localhost:27017/blooddonation
PORT=5000
```

### Step 3 — Seed Sample Data (Optional)
```bash
node seed.js
```

### Step 4 — Start the Server
```bash
npm start
# OR for development with auto-reload:
npm run dev
```

### Step 5 — Open in Browser
Visit: **http://localhost:5000**

---

## 🗄️ MongoDB Collections

| Collection     | Purpose                            |
|----------------|------------------------------------|
| `donors`       | Stores donor registration details  |
| `bloodrequests`| Stores patient blood requests      |
| `bloodstocks`  | Tracks units available per group   |

---

## 🔌 API Endpoints

### Donors
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/donors                 | Get all donors (filterable)|
| GET    | /api/donors/:id             | Get single donor         |
| POST   | /api/donors                 | Register new donor       |
| PUT    | /api/donors/:id             | Update donor             |
| DELETE | /api/donors/:id             | Remove donor             |
| PATCH  | /api/donors/:id/donate      | Record donation          |

### Blood Requests
| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | /api/requests                   | Get all requests        |
| POST   | /api/requests                   | Create request          |
| PATCH  | /api/requests/:id/status        | Update status           |
| DELETE | /api/requests/:id               | Delete request          |

### Blood Stock
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/stock              | Get all stock        |
| PUT    | /api/stock/:bloodGroup  | Update stock units   |

### Admin
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /api/admin/stats | Dashboard statistics |

---

## 🎯 Features

- ✅ Donor Registration with validation
- ✅ Blood Group Search by group + city
- ✅ Blood Request Management (Pending → Fulfilled/Cancelled)
- ✅ Blood Stock Tracking with visual indicators
- ✅ Admin Dashboard with live statistics
- ✅ MongoDB Indexes for fast queries
- ✅ Responsive design (mobile + desktop)
- ✅ Toast notifications for all actions

---

## 💡 MongoDB Concepts Used

- **Schemas & Models** — Mongoose schema definitions
- **Validation** — Built-in required, min/max, enum, regex
- **Indexes** — Compound indexes for blood group + city queries
- **Aggregation** — `$group` pipeline for donor statistics
- **`$inc`, `$set`** — Atomic update operators for stock management
- **`Promise.all`** — Parallel queries for dashboard stats
- **Upsert** — `findOneAndUpdate` with `upsert: true` for stock init

---

## 👨‍💻 Team

Mini project for DBMS course — Blood Donation Management System
Technologies: MongoDB · Node.js · Express · HTML · CSS · JavaScript
