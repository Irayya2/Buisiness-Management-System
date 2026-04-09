import React, { useState, useEffect } from 'react';
import { analyticsAPI, ordersAPI, productsAPI } from '../services/api-rbac';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { safeDate } from '../utils/dateUtils';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Filler,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, ordersData, productsData] = await Promise.all([
        analyticsAPI.getDashboardStats().catch(() => null),
        ordersAPI.getAll().catch(() => []),
        productsAPI.getAll().catch(() => [])
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load analytics data</div>;
  }

  // Sales by Month Chart
  const salesChartData = {
    labels: stats.salesByMonth.map(m => safeDate(m.month + '-01', 'MMM yyyy')),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats.salesByMonth.map(m => m.revenue),
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2
      }
    ]
  };

  // Orders by Status Chart
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255, 193, 7, 0.6)',
          'rgba(52, 152, 219, 0.6)',
          'rgba(40, 167, 69, 0.6)',
          'rgba(23, 162, 184, 0.6)',
          'rgba(220, 53, 69, 0.6)'
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Top Products Chart
  const topProductsData = {
    labels: stats.topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats.topProducts.map(p => p.revenue),
        backgroundColor: 'rgba(46, 204, 113, 0.6)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 2
      }
    ]
  };

  // Stock Status Chart
  const lowStockCount = products.filter(p => p.stock <= (p.min_stock ?? p.minStock ?? 0)).length;
  const inStockCount = products.length - lowStockCount;

  const stockChartData = {
    labels: ['In Stock', 'Low Stock'],
    datasets: [
      {
        data: [inStockCount, lowStockCount],
        backgroundColor: [
          'rgba(40, 167, 69, 0.6)',
          'rgba(220, 53, 69, 0.6)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        font: {
          size: 16
        }
      }
    }
  };

  return (
    <div className="analytics-page">
      <h2>Analytics & Reports</h2>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Sales Revenue Trend</h3>
          <div className="chart-container">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Orders by Status</h3>
          <div className="chart-container">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Products by Revenue</h3>
          <div className="chart-container">
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Stock Status Overview</h3>
          <div className="chart-container">
            <Doughnut data={stockChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="analytics-tables">
        <div className="table-card">
          <h3>Top Selling Products</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>₹{(parseFloat(product.revenue) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3>Monthly Sales Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {stats.salesByMonth.map((month, index) => (
                <tr key={index}>
                  <td>{safeDate(month.month + '-01', 'MMM yyyy')}</td>
                  <td>₹{(parseFloat(month.revenue) || 0).toFixed(2)}</td>
                  <td>{month.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;


