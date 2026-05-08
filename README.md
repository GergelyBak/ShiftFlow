# ShiftFlow 🗓️

A full-stack shift management application for scheduling and managing employees and their work shifts.

## 🔗 Live Demo

👉 [shift-flow-sigma.vercel.app](https://shift-flow-sigma.vercel.app)

## ✨ Features

- 👤 User authentication — register, login, protected routes
- 📅 Create, view, edit and delete work shifts
- 👥 Employee management — add and track staff
- 🔐 JWT-based secure API
- 📱 Responsive UI built with React & TypeScript

## 🛠 Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/GergelyBak/ShiftFlow.git
cd ShiftFlow
```

```bash
# Install frontend dependencies
cd client
npm install
npm run dev
```

```bash
# Install backend dependencies
cd server
npm install
```

### Environment Variables

Create a `.env` file in the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

```bash
# Start the backend
npm run dev
```

## 📁 Project Structure

```
ShiftFlow/
├── client/         # React + TypeScript frontend
│   └── src/
└── server/         # Node.js + Express backend
    └── src/
```

## 👨‍💻 Author

**Gergely Bak**
[github.com/GergelyBak](https://github.com/GergelyBak)
