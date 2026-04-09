import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, customersAPI, ordersAPI } from '../services/api-rbac';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { safeDate } from '../utils/dateUtils';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [txSearch, setTxSearch] = useState('');
  const [txStatus, setTxStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsData, ordersData, customersData] = await Promise.all([
        analyticsAPI.getDashboardStats().catch(() => null),
        ordersAPI.getAll().catch(() => []),
        customersAPI.getAll().catch(() => [])
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = useMemo(() => {
    if (!stats) return null;

    const users = customers.length || stats.totalCustomers || 0;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const conversionRate = stats.totalOrders ? (delivered / stats.totalOrders) * 100 : 0;

    const rev = stats.salesByMonth?.map(m => m.revenue || 0) || [];
    const last = rev[rev.length - 1] || 0;
    const prev = rev[rev.length - 2] || 0;
    const growth = prev > 0 ? ((last - prev) / prev) * 100 : 0;

    return {
      revenue: stats.totalRevenue || 0,
      users,
      conversionRate,
      growth
    };
  }, [customers.length, orders, stats]);

  const customerTypeCounts = useMemo(() => {
    return customers.reduce((acc, c) => {
      const key = c.type || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [customers]);

  const categoryRevenue = useMemo(() => {
    if (!stats?.topProducts) return {};
    return stats.topProducts.reduce((acc, p) => {
      const category = (p.name || 'Other').split(' ')[0] || 'Other';
      acc[category] = (acc[category] || 0) + (p.revenue || 0);
      return acc;
    }, {});
  }, [stats]);

  const recentTransactions = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = sorted.filter(o => {
      const q = txSearch.trim().toLowerCase();
      const matchesQuery = !q
        ? true
        : (o.orderNumber || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q);
      const matchesStatus = txStatus === 'all' ? true : o.status === txStatus;
      return matchesQuery && matchesStatus;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      total,
      totalPages,
      page: safePage,
      rows: filtered.slice(start, start + pageSize)
    };
  }, [orders, page, txSearch, txStatus]);

  useEffect(() => {
    setPage(1);
  }, [txSearch, txStatus]);

  const revenueLineData = useMemo(() => {
    if (!stats) return null;
    return {
      labels: stats.salesByMonth.map(m => safeDate(m.month + '-01', 'MMM')),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: stats.salesByMonth.map(m => m.revenue),
          borderColor: 'rgba(37, 99, 235, 1)',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 2
        }
      ]
    };
  }, [stats]);

  const categoryBarData = useMemo(() => {
    const labels = Object.keys(categoryRevenue);
    return {
      labels,
      datasets: [
        {
          label: 'Sales (₹)',
          data: labels.map(l => Math.round(categoryRevenue[l] * 100) / 100),
          backgroundColor: 'rgba(34, 197, 94, 0.25)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [categoryRevenue]);

  const userPieData = useMemo(() => {
    const labels = Object.keys(customerTypeCounts);
    const colors = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#64748B'];
    return {
      labels,
      datasets: [
        {
          data: labels.map(l => customerTypeCounts[l]),
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    };
  }, [customerTypeCounts]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(226,232,240,0.8)' } }
    }
  }), []);

  const exportTransactionsCsv = () => {
    const rows = recentTransactions.rows;
    const header = ['Order', 'Customer', 'Status', 'Total', 'Date'];
    const lines = [
      header.join(','),
      ...rows.map(o => {
        const date = o.createdAt ? safeDate(o.createdAt, 'MMM dd, yyyy') : '';
        const customer = (o.customerName || '').replaceAll('"', '""');
        return [
          `"${o.orderNumber || ''}"`,
          `"${customer}"`,
          `"${o.status || ''}"`,
          `${o.total || 0}`,
          `"${date}"`
        ].join(',');
      })
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="breadcrumb">Home / Dashboard</div>
        </div>
        <div className="dashboard-actions">
          <select className="select dashboard-range" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn btn-primary" type="button" onClick={exportTransactionsCsv}>
            Export
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {loading || !kpis ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton style={{ height: 14, width: 110, marginBottom: 12 }} />
                <Skeleton style={{ height: 30, width: '65%' }} />
                <Skeleton style={{ height: 12, width: '45%', marginTop: 12 }} />
              </CardBody>
            </Card>
          ))
        ) : (
          <>
            <Card
              className="kpi-card clickable"
              onClick={() => navigate('/analytics')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/analytics');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <CardBody>
                <div className="kpi-label" title="Total revenue across accessible branches">Revenue</div>
                <div className="kpi-value">₹{kpis.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="kpi-meta muted">View analytics →</div>
              </CardBody>
            </Card>
            <Card
              className="kpi-card clickable"
              onClick={() => navigate('/customers')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/customers');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <CardBody>
                <div className="kpi-label" title="Active customers in your scope">Users</div>
                <div className="kpi-value">{kpis.users}</div>
                <div className="kpi-meta muted">Manage customers →</div>
              </CardBody>
            </Card>
            <Card className="kpi-card" title="Delivered orders ÷ total orders">
              <CardBody>
                <div className="kpi-label">Conversion Rate</div>
                <div className="kpi-value">{kpis.conversionRate.toFixed(1)}%</div>
                <div className="kpi-meta muted">Delivered vs total</div>
              </CardBody>
            </Card>
            <Card className="kpi-card" title="Month-over-month revenue change">
              <CardBody>
                <div className="kpi-label">Growth</div>
                <div className="kpi-value">{Number.isFinite(kpis.growth) ? kpis.growth.toFixed(1) : '0.0'}%</div>
                <div className="kpi-meta muted">MoM revenue</div>
              </CardBody>
            </Card>
          </>
        )}
      </div>

      <div className="charts-grid">
        <Card>
          <CardHeader>
            <div>
              <div className="card-title">Revenue over time</div>
              <div className="card-subtitle">Trend line based on the last 6 months</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => navigate('/analytics')}>
              Open analytics
            </button>
          </CardHeader>
          <CardBody>
            <div className="chart-box">
              {loading || !revenueLineData ? (
                <Skeleton style={{ height: 260, width: '100%' }} />
              ) : (
                <Line data={revenueLineData} options={chartOptions} />
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="card-title">Sales by category</div>
              <div className="card-subtitle">Grouped from top product names</div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="chart-box">
              {loading ? <Skeleton style={{ height: 260, width: '100%' }} /> : <Bar data={categoryBarData} options={chartOptions} />}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <div className="card-title">User distribution</div>
              <div className="card-subtitle">Customers by type</div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="chart-box">
              {loading ? <Skeleton style={{ height: 260, width: '100%' }} /> : <Pie data={userPieData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom' } } }} />}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="transactions-card">
        <CardHeader>
          <div>
            <div className="card-title">Recent transactions</div>
            <div className="card-subtitle">Search, filter, and export your latest orders</div>
          </div>
          <div className="tx-controls">
            <input
              className="input tx-search"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search order or customer…"
              aria-label="Search transactions"
            />
            <select className="select tx-status" value={txStatus} onChange={(e) => setTxStatus(e.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="tx-skeleton">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} style={{ height: 44, width: '100%', marginBottom: 10 }} />
              ))}
            </div>
          ) : recentTransactions.total === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No transactions found</div>
              <div className="empty-subtitle">Try adjusting filters or create a new order.</div>
              <button className="btn btn-primary" type="button" onClick={() => navigate('/orders')}>
                Go to Transactions
              </button>
            </div>
          ) : (
            <>
              <div className="tx-table-wrap">
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th className="right">Total</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.rows.map((o) => (
                      <tr key={o.id}>
                        <td className="mono">{o.orderNumber}</td>
                        <td>{o.customerName || '—'}</td>
                        <td>
                          <span className={`status-pill status-${o.status}`}>{o.status}</span>
                        </td>
                        <td className="right">₹{(parseFloat(o.total) || 0).toFixed(2)}</td>
                        <td>{o.createdAt ? safeDate(o.createdAt, 'MMM dd, yyyy') : '—'}</td>
                        <td className="right">
                          <button className="btn btn-secondary" type="button" onClick={() => navigate('/orders')}>
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="tx-footer">
                <div className="muted">
                  Showing {(recentTransactions.page - 1) * pageSize + 1}–{Math.min(recentTransactions.page * pageSize, recentTransactions.total)} of {recentTransactions.total}
                </div>
                <div className="tx-pagination">
                  <button className="btn btn-secondary" type="button" disabled={recentTransactions.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    Prev
                  </button>
                  <div className="tx-page">{recentTransactions.page} / {recentTransactions.totalPages}</div>
                  <button className="btn btn-secondary" type="button" disabled={recentTransactions.page >= recentTransactions.totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
