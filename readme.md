# Full-Stack Application

This repository contains a full-stack application with a frontend client and backend server.

## Repository Structure

```
repository/
├── frontend/      # Frontend application
├── backend/       # Backend application
├── README.md      # This file
└── .gitignore     # Git ignore file
```

## Local Development

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Set up the backend server:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Start the development server:
   ```bash
   python server.py
   ```
   The server should now be running at `http://localhost:5000`.

### Frontend Setup

1. Open a new terminal window/tab

2. Navigate to the frontend directory:
   ```bash
   cd your-repo-name/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend development server should now be running at `http://localhost:8080`.

5. Open your browser and navigate to `http://localhost:8080`

## Troubleshooting

- If you encounter any port conflicts, make sure no other applications are using ports 3000 or 5000
- Ensure you have the correct versions of Node.js and Python installed