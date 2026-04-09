# Sales Order Admin Panel

A comprehensive React.js-based Sales Order Management System with Admin Panel for wholesale inventory and sales management. This application provides a unified interface for managing products, sales orders, suppliers, customers, and analytics - all without requiring an external database.

## Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (Admin, Sales Manager, Clerk)
- Session management with localStorage

### 📦 Product & Inventory Management
- Complete product CRUD operations
- Real-time stock tracking
- Batch and expiry date management
- Low stock alerts
- Minimum stock level monitoring

### 🛒 Sales Order Processing
- Create, edit, and delete sales orders
- Multi-item order support
- Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- Automatic stock deduction on order creation
- Invoice generation and download
- Order history tracking

### 👥 Customer Management
- Customer CRUD operations
- Customer type classification (Wholesale, Retail, Corporate)
- Credit limit management
- Contact information management

### 🏭 Supplier Management
- Supplier CRUD operations
- Contact person tracking
- Supplier information management

### 📊 Analytics & Reporting
- Interactive dashboards with Chart.js
- Sales revenue trends (Line charts)
- Order status distribution (Doughnut charts)
- Top products by revenue (Bar charts)
- Stock status overview
- Monthly sales summaries
- Real-time statistics

### 🔔 Real-time Notifications
- Low stock alerts
- System notifications
- Notification center with unread count
- Mark as read functionality

## Technology Stack

- **Frontend Framework**: React 18
- **Routing**: React Router DOM v6
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS3 with modern responsive design
- **State Management**: React Context API
- **Data Persistence**: localStorage (no external database)
- **Notifications**: React Toastify
- **Date Handling**: date-fns

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Default Login Credentials

The application comes with three pre-configured user accounts:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Sales Manager | `manager` | `manager123` |
| Sales Clerk | `clerk` | `clerk123` |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main layout with sidebar and navigation
│   └── Layout.css
├── contexts/            # React Context providers
│   ├── AuthContext.jsx  # Authentication context
│   └── NotificationContext.jsx  # Notifications context
├── pages/               # Page components
│   ├── Login.jsx        # Login page
│   ├── Dashboard.jsx    # Dashboard with overview stats
│   ├── Products.jsx     # Product management
│   ├── Orders.jsx       # Sales order management
│   ├── Customers.jsx    # Customer management
│   ├── Suppliers.jsx   # Supplier management
│   └── Analytics.jsx    # Analytics and reports
├── services/            # API services
│   └── api.js          # Mock API with localStorage
├── App.jsx              # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Key Features Explained

### Data Persistence
All data is stored in the browser's localStorage, making this a fully client-side application. No backend server or database is required. Data persists across browser sessions.

### Real-time Stock Tracking
When a sales order is created, the system automatically:
- Deducts quantities from product stock
- Validates stock availability
- Updates inventory in real-time

### Invoice Generation
Orders can generate downloadable invoice files in text format, including:
- Order number and date
- Itemized list with quantities and prices
- Subtotal, tax, and total calculations

### Role-Based Access
The system supports three user roles:
- **Admin**: Full access to all features
- **Sales Manager**: Can manage orders, customers, and view analytics
- **Clerk**: Limited access for order entry and basic operations

### Responsive Design
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Usage Guide

### Creating a Product
1. Navigate to **Products** from the sidebar
2. Click **+ Add Product**
3. Fill in product details (name, SKU, category, price, stock, etc.)
4. Click **Create**

### Creating a Sales Order
1. Navigate to **Orders** from the sidebar
2. Click **+ Create Order**
3. Select a customer
4. Add products and quantities
5. Click **Create** to process the order

### Viewing Analytics
1. Navigate to **Analytics** from the sidebar
2. View interactive charts and reports
3. Analyze sales trends and top products

### Managing Customers/Suppliers
1. Navigate to **Customers** or **Suppliers**
2. Click **+ Add** to create new entries
3. Use **Edit** to update information
4. Use **Delete** to remove entries

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- All API calls are simulated with a 500ms delay
- Data is stored in localStorage under keys: `users`, `products`, `orders`, `customers`, `suppliers`, `notifications`
- JWT tokens are base64 encoded (simplified for demo purposes)
- Real-time notifications are simulated with setInterval

## Future Enhancements

Potential improvements for production use:
- Integration with real backend API
- Database integration (PostgreSQL, MySQL, etc.)
- Advanced reporting with export to PDF/Excel
- Email notifications
- Multi-warehouse support
- Purchase order management
- Advanced search and filtering
- Data import/export functionality

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please refer to the code comments or documentation within the source files.


