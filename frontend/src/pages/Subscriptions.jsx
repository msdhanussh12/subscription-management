import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import SubscriptionForm from './SubscriptionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Subscriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [cycleFilter, setCycleFilter] = useState(searchParams.get('billingCycle') || 'All');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetSub, setStatusTargetSub] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSubscriptions = async () => {
    try {
      setError('');
      const res = await subscriptionService.getAll({
        search: debouncedSearch,
        status: statusFilter,
        billingCycle: cycleFilter
      });
      if (res.success) {
        setSubscriptions(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [debouncedSearch, statusFilter, cycleFilter]);

  const handleOpenAdd = () => {
    setSelectedSubscription(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setSelectedSubscription(sub);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedSubscription) {
        await subscriptionService.update(selectedSubscription.id, formData);
      } else {
        await subscriptionService.create(formData);
      }
      setFormOpen(false);
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (sub) => {
    setSubscriptionToDelete(sub);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;
    setIsSubmitting(true);
    try {
      await subscriptionService.delete(subscriptionToDelete.id);
      setDeleteConfirmOpen(false);
      setSubscriptionToDelete(null);
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete subscription');
      setDeleteConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStatusModal = (sub) => {
    setStatusTargetSub(sub);
    setNewStatusValue(sub.status);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusTargetSub) return;
    setIsSubmitting(true);
    try {
      await subscriptionService.updateStatus(statusTargetSub.id, newStatusValue);
      setStatusModalOpen(false);
      setStatusTargetSub(null);
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change status');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1>Subscriptions Management</h1>
          <p>Monitor active subscriptions, renewal dates, and status transitions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchSubscriptions} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchSubscriptions} onDismiss={() => setError('')} />

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer name or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Billing Cycle Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Cycle:</label>
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
          >
            <option value="All">All Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        {(search || statusFilter !== 'All' || cycleFilter !== 'All') && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setCycleFilter('All');
            }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table / Results */}
      {loading ? (
        <Loading text="Retrieving subscription registry from database..." />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions match your criteria"
          description="Adjust your search terms or filters, or create a new customer subscription."
          actionLabel="Create Subscription"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Plan Tier</th>
                <th>Price</th>
                <th>Cycle</th>
                <th>Period</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    #{sub.id}
                  </td>
                  <td>
                    <Link
                      to={`/customers/${sub.customer_id}`}
                      style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {sub.customer_name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {sub.customer_company || sub.customer_email}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{sub.plan_name}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(sub.price)}</td>
                  <td>
                    <span className="badge badge-cycle">{sub.billing_cycle}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>{new Date(sub.start_date).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      to {new Date(sub.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenStatusModal(sub)}
                      className={`badge badge-${sub.status.toLowerCase()}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to change status"
                    >
                      <span className="badge-dot" />
                      {sub.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        to={`/subscriptions/${sub.id}`}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="View Subscription"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Edit Subscription"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(sub)}
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete Subscription"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscription Form Modal */}
      <SubscriptionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSubscription}
        isSubmitting={isSubmitting}
      />

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Subscription Status"
        maxWidth="440px"
      >
        <form onSubmit={handleStatusSubmit}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Change subscription status for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {statusTargetSub?.customer_name} ({statusTargetSub?.plan_name})
            </strong>:
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="status-select">
              New Status
            </label>
            <select
              id="status-select"
              value={newStatusValue}
              onChange={(e) => setNewStatusValue(e.target.value)}
              className="form-select"
            >
              <option value="Active">Active (Generating Revenue)</option>
              <option value="Cancelled">Cancelled (Terminated)</option>
              <option value="Expired">Expired (End Date Passed)</option>
            </select>
          </div>

          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="btn btn-secondary btn-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={
          subscriptionToDelete
            ? `Are you sure you want to permanently delete subscription #${subscriptionToDelete.id} for "${subscriptionToDelete.customer_name}"?`
            : ''
        }
        confirmLabel="Delete Subscription"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Subscriptions;
