![Railway Pro Hero](./frontend/assets/readme-hero.png)

# 🚄 Railway Pro: Advanced Train Delay Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue.svg)](https://www.mysql.com/)
[![UI Style](https://img.shields.io/badge/UI-Glassmorphism-purple.svg)](#)

**Railway Pro** is a state-of-the-art, full-stack management and analytics platform designed for modern railway operations. It provides real-time monitoring, deep data analytics, and a comprehensive administration suite to optimize fleet performance and minimize delays.

---

## ✨ Key Features

### 📊 Intelligence Dashboard
- **Real-time KPIs**: Monitor On-Time %, Average Delay, and total traffic at a glance.
- **Dynamic Charting**: Visualize delay trends and performance distributions using Chart.js.
- **Top Entities**: Automatically identify the most delayed trains and stations.

### 🛡️ Role-Based Access (RBAC)
- **Admins**: Full CRUD access to trains, stations, and performance metrics.
- **Station Managers**: View reports, manage specific logs, and export data.
- **Public Users**: Access read-only dashboards and schedules.

### ⚙️ Quick-Add Admin Panel
- **Unified Management**: Tabbed interface for rapid data entry and modification.
- **Live Logs**: Track system updates and data scraping activities in real-time.
- **Data Export**: One-click CSV generation for professional reporting.

### 💎 Premium Design System
- **Glassmorphism UI**: Modern dark theme with high-contrast accents and subtle blurs.
- **Micro-animations**: Smooth transitions and interactive elements for a superior UX.
- **Responsive Layout**: Fully optimized for desktops, tablets, and mobile devices.

---

## 🏗️ Project Architecture

```bash
├── backend/
│   ├── middleware/      # Auth & RBAC security layers
│   ├── routes/          # RESTful API Endpoints
│   ├── db.js            # MySQL Connection Pool
│   └── server.js        # Express application entry
├── database/
│   └── schema.sql       # Database structure & Sample data
└── frontend/
    ├── css/             # Premium Design System (Vanilla CSS)
    ├── js/              # Module logic & API integration
    └── assets/          # High-resolution media & Icons
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/) (v8.0 or higher)

### 1. Database Configuration
1. Create a MySQL database named `train_delay_management_system`.
2. Import the schema:
   ```bash
   mysql -u root -p train_delay_management_system < database/schema.sql
   ```
3. **Note**: Update credentials in `backend/db.js` if your local setup differs.

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Launching the App
```bash
npm start
```
The application will be available at `http://localhost:3000`.

### Default Credentials
| Role    | Username  | Password    |
| ------- | --------- | ----------- |
| Admin   | `admin`   | `admin123`  |
| Manager | `manager` | `manager123`|
| User    | `user`    | `user123`   |

---

## 📡 API Overview

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticate user sessions |
| `/api/trains` | `GET/POST/PUT` | Admin | Manage railway fleet |
| `/api/stations` | `GET/POST` | Admin | Manage station nodes |
| `/api/summary` | `GET` | Public | Fetch Dashboard KPI data |
| `/api/reports/trains` | `GET` | Staff | Export Train data to CSV |

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Custom Design System), JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Security**: express-session, bcrypt (planned), RBAC Middleware

---

_Developed with a focus on precision, performance, and aesthetic excellence._
