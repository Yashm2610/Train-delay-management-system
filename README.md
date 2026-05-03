# 🚄 Railway Pro: Advanced Train Delay Management System

A professional, full-stack web application designed for comprehensive railway monitoring, analytics, and fleet management.

## 🌟 Professional Features

- **Role-Based Authentication**: Secure access control for Admins, Station Managers, and Users.
- **Advanced Analytics**: Interactive data visualization using Chart.js (Delay trends, Performance distribution, Daily logs).
- **Comprehensive Dashboard**: Real-time KPIs including On-Time %, Avg Delay, and Worst Affected entities.
- **Full CRUD Management**: Dedicated administration panel for managing Trains, Stations, Delay Statistics, and Punctuality Metrics (Delay Percentages).
- **Update Logs**: Real-time tracking of scraping logs and data updates.
- **Data Export**: Export critical reports in CSV format for offline analysis.
- **Intelligent Alerts**: Visual severity system for system-wide delay warnings.
- **Premium UI/UX**: Modern glassmorphism design, responsive sidebar, and smooth transitions across all modules.

## 📁 Project Structure

```
├── backend/
│   ├── middleware/      # Auth & RBAC logic
│   ├── routes/          # API endpoints (Auth, Trains, Stations, Stats, Logs, etc.)
│   ├── db.js            # Database connection
│   └── server.js        # Express application entry
├── database/
│   └── schema.sql       # SQL scripts for tables and sample data
└── frontend/
│   ├── assets/          # Images and icons
│   ├── css/             # Premium stylesheets
│   ├── js/              # Application logic & Charting
│   └── *.html           # Modern application pages (Dashboard, Admin, Stations, Stats, etc.)
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: SQL (MySQL/PostgreSQL compatible)
- **Session**: express-session for secure authentication

## 🚀 Getting Started

### 1. Database Setup

1. Open your SQL client.
2. Execute the `database/schema.sql` script to create the database and tables.
3. Sample accounts are created:
   - **Admin**: `admin` / `admin123`
   - **Manager**: `manager` / `manager123`
   - **User**: `user` / `user123`

### 2. Backend Installation

```bash
cd backend
npm install
```

### 3. Run the Application

```bash
npm start
```

The server will start at `http://localhost:3000`.

## 📡 API Routes

| Route                    | Method              | Description                         | Access        |
| ------------------------ | ------------------- | ----------------------------------- | ------------- |
| `/api/auth/login`        | POST                | User login                          | All           |
| `/api/trains`            | GET                 | List trains with search/sort        | All           |
| `/api/trains`            | POST/PUT/DELETE     | Manage trains                       | Admin         |
| `/api/stations`          | GET                 | List stations                       | All           |
| `/api/stations`          | POST/PUT/DELETE     | Manage stations                     | Admin         |
| `/api/delay-stats`       | GET/POST/PUT/DELETE | Manage average delay data           | All/Admin     |
| `/api/delay-percentage`  | GET/POST/PUT/DELETE | Manage punctuality data             | All/Admin     |
| `/api/update-log`        | GET/POST/DELETE     | Manage data update/scraping logs    | All/Admin     |
| `/api/summary`           | GET                 | Dashboard KPI data                  | All           |
| `/api/reports/trains`    | GET                 | Export trains CSV                   | Admin/Manager |

---

_Developed with focus on performance and aesthetics._
