# 📊 Habit Tracker

A full-stack habit tracking application built with React. This app helps users build and maintain healthy habits through daily tracking and visualization.

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

bash
git clone https://github.com/Nidhi-Phophaliya/Habit-Tracker.git
cd Habit-Tracker
2. Install Dependencies
bash
Copy
Edit
npm install
🖥️ Running the Project
Step 1: Start the Server
Start the backend server. This could be an Express.js or JSON server based on your configuration.

bash
Copy
Edit
npm run server
Step 2: Initialize the Database (Optional)
If there's a setup or seeding script for your database, run:

bash
Copy
Edit
npm run db:init
Replace db:init with your actual initialization command if different.

Step 3: Run the React Frontend
Open a new terminal in the same project directory and run:

bash
Copy
Edit
npm run dev -- --force
This starts the frontend development server using Vite with forced dependency rebuild.

📁 Project Structure
php
Copy
Edit
Habit-Tracker/
├── server/              # Backend server logic
├── src/                 # React components and frontend logic
├── public/              # Static files and assets
├── package.json         # Project scripts and dependencies
└── README.md
🔧 Available Scripts
Script	Description
npm run server	Starts the backend server
npm run dev -- --force	Starts React frontend (Vite) with forced rebuild
npm run build	Builds the React app for production
npm run db:init	Initializes or seeds the database (if applicable)

🛠 Technologies Used
React (Frontend)

Vite (Build tool)

Node.js / Express or JSON Server (Backend)

CSS / TailwindCSS (Styling)

MongoDB
