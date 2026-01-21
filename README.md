# Industrial Asset Monitoring Dashboard

A full-stack industrial IoT application for real-time sensor monitoring, featuring live sensor data simulation, alert systems, and automated reporting.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Industrial+Dashboard+Preview)

## 🚀 Features

*   **Real-time Monitoring**: Live visualization of machine metrics (Temperature, Vibration, Speed).
*   **Asset Management**: complete CRUD (Create, Read, Update, Delete) operations for industrial machines.
*   **Intelligent Alerts**: Automated visual alarms for 'Critical' and 'Danger' machine states.
*   **Data Simulation**: Built-in background service simulating realistic sensor data patterns and drift.
*   **interactive Charts**: Historical trend analysis using responsive charts.
*   **Reporting**: specific PDF generation for plant health summaries.
*   **Authentication**: Secure JWT-based login system.

## 🛠️ Tech Stack

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Database**: SQLite (Dev) / SQLAlchemy ORM
*   **Simulation**: AsyncIO background tasks
*   **Utilities**: Pandas, ReportLab (PDF)

### Frontend
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.8+
*   Node.js 16+

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
The API will start at `http://localhost:8000`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🔑 Usage

1.  **Login**: Use the default credentials (or create a user via script):
    *   **Email**: `test@test.com`
    *   **Password**: `12345`
2.  **Dashboard**: Monitor the live status of all assets.
3.  **Manage Assets**: Go to the "Assets" page to add new machines.
4.  **View Details**: Click on any machine name to view historical charts.
5.  **Reports**: Navigate to "Reports" to download a system summary PDF.

## 📂 Project Structure

```
industrial_dashboard/
├── backend/            # FastAPI Server
│   ├── routers/        # API Endpoints (Auth, Machines, Data)
│   ├── database.py     # DB Connection
│   ├── models.py       # SQLAlchemy Models
│   ├── simulation.py   # Data generator service
│   └── main.py         # Entry point
│
└── frontend/           # React Client
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── contexts/   # Auth State
    │   ├── pages/      # Route views (Dashboard, Login, etc.)
    │   └── api/        # Axios configuration
    └── ...
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
