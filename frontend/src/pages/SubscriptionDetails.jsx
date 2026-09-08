import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import SubscriptionForm from './SubscriptionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  Layers, 
  Calendar, 
  Clock, 
  IndianRupee, 
  Edit2, 
  Trash2, 
  Building2, 
  Mail, 
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const SubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setError('');
      const res = await subscriptionService.getById(id);
      if (res.success) {
        setSubscription(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await subscriptionService.update(id, formData);
      setFormOpen(false);
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await subscriptionService.updateStatus(id, newStatus);
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await subscriptionService.delete(id);
      navigate('/subscriptions');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete subscription');
      setDeleteConfirmOpen(false);
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

  if (loading) {
    return <Loading text="Fetching subscription specifications..." />;
  }

  if (!subscription && !loading) {
    return (
      <div className="page-container">
        <ErrorMessage message={error || 'Subscription not found.'} />
        <Link to="/subscriptions" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Subscriptions</span>
        </Link>
      </div>
    );
  }

  const { customer, plan } = subscription;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/subscriptions" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.4rem' }}>
          <ArrowLeft size={15} />
          <span>Back to Subscriptions</span>
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={fetchDetails} onDismiss={() => setError('')} />

      {/* Main Subscription Banner */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                Subscription #{subscription.id}
              </h1>
              <span className={`badge badge-${subscription.status.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                <span className="badge-dot" />
                {subscription.status}
              </span>
              <span className="badge badge-cycle">
                {subscription.billing_cycle}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Created on {new Date(subscription.created_at).toLocaleDateString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setFormOpen(true)} className="btn btn-secondary btn-sm">
              <Edit2 size={15} />
              <span>Edit</span>
            </button>
            <button onClick={() => setDeleteConfirmOpen(true)} className="btn btn-danger btn-sm">
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Quick Status Update:
          </span>
          <button
            onClick={() => handleStatusChange('Active')}
            disabled={subscription.status === 'Active' || isSubmitting}
            className={`btn btn-sm ${subscription.status === 'Active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <CheckCircle2 size={14} />
            <span>Mark Active</span>
          </button>
          <button
            onClick={() => handleStatusChange('Cancelled')}
            disabled={subscription.status === 'Cancelled' || isSubmitting}
            className={`btn btn-sm ${subscription.status === 'Cancelled' ? 'btn-danger' : 'btn-secondary'}`}
          >
            <XCircle size={14} />
            <span>Mark Cancelled</span>
          </button>
          <button
            onClick={() => handleStatusChange('Expired')}
            disabled={subscription.status === 'Expired' || isSubmitting}
            className="btn btn-secondary btn-sm"
          >
            <Clock size={14} />
            <span>Mark Expired</span>
          </button>
        </div>

        {/* Financial & Schedule Highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Subscription Rate
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(subscription.price)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Billed {subscription.billing_cycle.toLowerCase()}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              MRR Contribution
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
              {subscription.status === 'Active'
                ? formatCurrency(
                    subscription.billing_cycle === 'Yearly'
                      ? subscription.price / 12
                      : subscription.price
                  )
                : '₹0.00'}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {subscription.status === 'Active' ? 'Active recurring revenue' : 'Inactive subscription'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Billing Cycle Period
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.45rem' }}>
              {new Date(subscription.start_date).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              to {new Date(subscription.end_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Linked Details: Customer Card & Plan Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Customer Information Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--brand-400)' }} />
              <span>Customer Information</span>
            </h2>
            {customer && (
              <Link to={`/customers/${customer.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                View Profile
              </Link>
            )}
          </div>

          {customer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</span>
                <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company</span>
                <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} />
                  <span>{customer.company || 'N/A'}</span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</span>
                <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} />
                  <span>{customer.phone || 'N/A'}</span>
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Customer details not available.</p>
          )}
        </div>

        {/* Plan Information Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--brand-400)' }} />
              <span>Subscription Tier Details</span>
            </h2>
            <Link to="/plans" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
              All Plans
            </Link>
          </div>

          {plan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan Name</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{plan.plan_name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Default Pricing</span>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {formatCurrency(plan.price)} ({plan.billing_cycle})
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {plan.description || 'No plan description provided.'}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Plan details not available.</p>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <SubscriptionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={subscription}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to permanently delete subscription #${subscription.id}?`}
        confirmLabel="Delete Subscription"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default SubscriptionDetails;
