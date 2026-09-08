import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../context/ThemeContext';
import { 
  Users, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  TrendingUp, 
  RefreshCw,
  Plus,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LabelList
} from 'recharts';

const STATUS_COLORS = {
  active: '#10b981',
  cancelled: '#ef4444',
  expired: '#f59e0b'
};

const Dashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const chartTextColor = isDark ? '#f8fafc' : '#0f172a';

  const fetchStats = async () => {
    try {
      setError('');
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return <Loading text="Aggregating subscription statistics from database..." />;
  }

  // Format chart data
  const pieData = stats?.subscriptionStatus ? [
    { name: 'Active', value: stats.subscriptionStatus.active || 0, color: STATUS_COLORS.active },
    { name: 'Cancelled', value: stats.subscriptionStatus.cancelled || 0, color: STATUS_COLORS.cancelled },
    { name: 'Expired', value: stats.subscriptionStatus.expired || 0, color: STATUS_COLORS.expired }
  ] : [];

  const barData = stats?.subscriptionStatus ? [
    { name: 'Active', count: stats.subscriptionStatus.active || 0, fill: STATUS_COLORS.active },
    { name: 'Cancelled', count: stats.subscriptionStatus.cancelled || 0, fill: STATUS_COLORS.cancelled },
    { name: 'Expired', count: stats.subscriptionStatus.expired || 0, fill: STATUS_COLORS.expired }
  ] : [];

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Subscription Dashboard</h1>
          <p>Real-time analytics and revenue metrics powered by MySQL</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleRefresh} 
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            title="Refresh database metrics"
          >
            <RefreshCw size={15} className={refreshing ? 'spinner-sm' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
          <Link to="/subscriptions" className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>New Subscription</span>
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchStats} onDismiss={() => setError('')} />

      {/* 5 Main Statistic Cards */}
      <div className="stats-grid">
        {/* Total Customers */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Customers</span>
            <div className="stat-icon">
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalCustomers ?? 0}</div>
          <div className="stat-subtext">Registered client accounts</div>
        </div>

        {/* Total Subscriptions */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Subscriptions</span>
            <div className="stat-icon">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalSubscriptions ?? 0}</div>
          <div className="stat-subtext">All historical subscriptions</div>
        </div>

        {/* Active Subscriptions */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Subscriptions</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{stats?.activeSubscriptions ?? 0}</div>
          <div className="stat-subtext">Currently generating revenue</div>
        </div>

        {/* Cancelled Subscriptions */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Cancelled</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#f87171' }}>{stats?.cancelledSubscriptions ?? 0}</div>
          <div className="stat-subtext">Terminated before renewal</div>
        </div>

        {/* Monthly Recurring Revenue (MRR) */}
        <div className="stat-card mrr" style={{ gridColumn: 'span 1' }}>
          <div className="stat-card-header">
            <span className="stat-label" style={{ color: '#34d399' }}>Monthly Recurring Revenue</span>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#fff', fontSize: '1.75rem' }}>
            {formatCurrency(stats?.mrr)}
          </div>
          <div className="stat-subtext" style={{ color: '#94a3b8' }}>
            Monthly + (Yearly / 12) from active subs
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="chart-grid">
        {/* Donut Chart: Status Distribution */}
        <div className="card chart-card">
          <h2 className="chart-title" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            <PieChartIcon size={18} style={{ color: 'var(--brand-400)' }} />
            <span>Subscription Status Breakdown</span>
          </h2>
          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface-elevated)', 
                    borderColor: 'var(--border-strong)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value, entry) => (
                    <span style={{ color: chartTextColor, fontWeight: 600, fontSize: '0.9rem', marginRight: '0.75rem' }}>
                      {value} ({entry.payload?.value || 0})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Status Volume Comparison */}
        <div className="card chart-card">
          <h2 className="chart-title" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            <BarChart3 size={18} style={{ color: 'var(--brand-400)' }} />
            <span>Subscription Counts by Status</span>
          </h2>
          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--border-strong)" 
                  tick={{ fill: chartTextColor, fontSize: 13, fontWeight: 600 }}
                  tickLine={false} 
                />
                <YAxis 
                  stroke="var(--border-strong)" 
                  tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface-elevated)', 
                    borderColor: 'var(--border-strong)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }} 
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={42}>
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    fill={chartTextColor} 
                    fontSize={13} 
                    fontWeight={700} 
                    offset={6} 
                  />
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Recent Subscriptions</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Latest subscriptions added to the platform</p>
          </div>
          <Link to="/subscriptions" className="btn btn-secondary btn-sm">
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Billing Cycle</th>
                <th>Price</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentSubscriptions && stats.recentSubscriptions.length > 0 ? (
                stats.recentSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customer_email}</div>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      <span className="badge badge-cycle">{sub.billing_cycle}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(sub.price)}</td>
                    <td>
                      <span className={`badge badge-${sub.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(sub.start_date).toLocaleDateString()}
                    </td>
                    <td>
                      <Link to={`/subscriptions/${sub.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recent subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
