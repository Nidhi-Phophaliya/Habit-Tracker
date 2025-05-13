title: "📊 Habit Tracker"
  description: >
    A full-stack habit tracking application built with React. This app helps users build and maintain 
    healthy habits through daily tracking and visualization.

  getting_started:
    - step: "Clone the Repository"
      command: |
        git clone https://github.com/Nidhi-Phophaliya/Habit-Tracker.git
        cd Habit-Tracker
    - step: "Install Dependencies"
      command: |
        npm install

  running_project:
    - step: "Start the Server"
      command: npm run server
    - step: "Initialize the Database (Optional)"
      command: npm run db:init
    - step: "Start the React Frontend"
      note: "Run this in a new terminal"
      command: npm run dev -- --force

  project_structure: |
    Habit-Tracker/
    ├── server/              # Backend server logic
    ├── src/                 # React components and frontend logic
    ├── public/              # Static files and assets
    ├── package.json         # Project scripts and dependencies
    └── README.md

  scripts:
    - name: "npm run server"
      description: "Starts the backend server"
    - name: "npm run dev -- --force"
      description: "Starts React frontend (Vite) with forced rebuild"
    - name: "npm run build"
      description: "Builds the React app for production"
    - name: "npm run db:init"
      description: "Initializes or seeds the database (if applicable)"

  technologies_used:
    - React (Frontend)
    - Vite (Build tool)
    - Node.js / Express or JSON Server (Backend)
    - CSS / TailwindCSS (Styling)
    - Local Storage / MongoDB / SQLite (Database options)

  contact:
    maintainer: "Nidhi Phophaliya"
    github: "https://github.com/Nidhi-Phophaliya"
    note: "Feel free to raise issues or contribute to improve the project."
