# Quick Start Guide

## Prerequisites

Make sure you have **Node.js** installed on your system. You can download it from [nodejs.org](https://nodejs.org/) if you don't have it.

To check if Node.js is installed, open your terminal/command prompt and run:
```bash
node --version
npm --version
```

## Step-by-Step Instructions

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory (`c:\app`) and run:

```bash
npm install
```

This will install all required packages (React, Chart.js, React Router, etc.). This may take a few minutes.

### Step 2: Start the Development Server

After installation is complete, run:

```bash
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

The application will automatically open in your default browser, or you can manually navigate to:
```
http://localhost:3000
```

### Step 4: Login

Use one of these demo credentials to login:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Sales Manager** | `manager` | `manager123` |
| **Sales Clerk** | `clerk` | `clerk123` |

## Available Commands

- **`npm run dev`** - Start development server (with hot reload)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the actual URL.

### Module Not Found Errors
If you encounter module errors, try:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

On Windows PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Browser Not Opening Automatically
Manually navigate to the URL shown in the terminal (usually `http://localhost:3000`)

## What to Expect

Once logged in, you'll see:
- **Dashboard** - Overview with statistics and charts
- **Products** - Manage inventory and products
- **Orders** - Create and manage sales orders
- **Customers** - Manage customer information
- **Suppliers** - Manage supplier information
- **Analytics** - View detailed reports and charts

## Data Persistence

All data is stored in your browser's localStorage, so:
- Data persists between sessions
- Each browser has its own data
- To reset data, clear browser localStorage

## Stopping the Server

Press `Ctrl + C` in the terminal to stop the development server.


