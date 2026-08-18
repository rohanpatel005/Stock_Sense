# StockSense

StockSense is a modern, comprehensive stock market portfolio management and trading simulation platform. It empowers users with real-time market data, AI-driven insights, and intuitive portfolio tracking.

## 🚀 Features

- **Real-Time Market Data**: Live stock quotes, charts, and market overview via WebSockets.
- **Portfolio Management**: Track your holdings, monitor performance, and view your asset allocation.
- **Trading Simulation**: Execute buy/sell orders in a simulated environment to test your strategies.
- **AI-Powered Insights**: Get intelligent stock analysis and market summaries.
- **Personalized Watchlist**: Keep an eye on your favorite stocks.
- **Market News**: Stay updated with the latest financial news and articles.
- **Interactive Charts**: Advanced, interactive charting capabilities.
- **Modern UI/UX**: A beautiful, responsive interface with smooth animations and transitions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM v7
- **Charts**: ApexCharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Django 6.0 & Django REST Framework
- **Database**: PostgreSQL
- **Real-time**: Django Channels & Redis
- **Authentication**: JWT Auth (`djangorestframework-simplejwt`)
- **Market Data**: `yfinance`
- **AI Integration**: Groq API
- **Web Scraping/Parsing**: BeautifulSoup4, Feedparser

## 📂 Project Structure

```text
StockSense/
├── backend/                # Django REST API backend
│   ├── apps/               # Django applications (ai, dashboard, market, news, orders, portfolio, users, etc.)
│   ├── config/             # Django project settings
│   └── requirements.txt    # Python dependencies
└── frontend/               # React Vite frontend
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application pages
    │   ├── services/       # API integration
    │   └── ...
    └── package.json        # Node.js dependencies
```

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis Server

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend` directory based on your local configuration requirements (Database URL, Redis URL, Groq API Key, Secret Key, etc.).

5. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `frontend` directory and add your backend API URL if needed (e.g., `VITE_API_URL=http://localhost:8000`).

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.

---
*Built to make stock analysis and portfolio management smarter and more intuitive.*
