import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import CustomerForm from './CustomerForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Plus,
  Clock
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setError('');
      const res = await customerService.getById(id);
      if (res.success) {
        setCustomer(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load customer details');
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
      await customerService.update(id, formData);
      setFormOpen(false);
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await customerService.delete(id);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete customer');
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
    return <Loading text="Fetching customer and subscription history..." />;
  }

  if (!customer && !loading) {
    return (
      <div className="page-container">
        <ErrorMessage message={error || 'Customer not found.'} />
        <Link to="/customers" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.4rem' }}>
          <ArrowLeft size={15} />
          <span>Back to Customers</span>
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={fetchDetails} onDismiss={() => setError('')} />

      {/* Customer Header & Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{customer.name}</h1>
              <span className="badge badge-cycle" style={{ fontFamily: 'var(--font-mono)' }}>
                ID: #{customer.id}
              </span>
            </div>
            {customer.company && (
              <p style={{ color: 'var(--brand-400)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={16} />
                <span>{customer.company}</span>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setFormOpen(true)} className="btn btn-secondary btn-sm">
              <Edit2 size={15} />
              <span>Edit Info</span>
            </button>
            <button onClick={() => setDeleteConfirmOpen(true)} className="btn btn-danger btn-sm">
              <Trash2 size={15} />
              <span>Delete Customer</span>
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Email Address
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <Mail size={15} style={{ color: 'var(--brand-400)' }} />
              <span>{customer.email}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Phone Number
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <Phone size={15} style={{ color: 'var(--brand-400)' }} />
              <span>{customer.phone || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Physical Address
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <MapPin size={15} style={{ color: 'var(--brand-400)' }} />
              <span>{customer.address || 'No address provided'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              Customer Since
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <Calendar size={15} style={{ color: 'var(--brand-400)' }} />
              <span>{new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Linked to this Customer */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Associated Subscriptions</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              All current and past billing cycles for {customer.name}
            </p>
          </div>
          <Link
            to={`/subscriptions?customer=${customer.id}`}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>New Subscription for Customer</span>
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Plan Name</th>
                <th>Cycle</th>
                <th>Price</th>
                <th>Status</th>
                <th>Period</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer.subscriptions && customer.subscriptions.length > 0 ? (
                customer.subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      #{sub.id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{sub.plan_name}</td>
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
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(sub.start_date).toLocaleDateString()} &rarr; {new Date(sub.end_date).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/subscriptions/${sub.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    No subscriptions registered for this customer yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Form Modal */}
      <CustomerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={customer}
        isSubmitting={isSubmitting}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.name}"? If active subscriptions exist, deletion will be blocked to maintain data integrity.`}
        confirmLabel="Delete Customer"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CustomerDetails;
