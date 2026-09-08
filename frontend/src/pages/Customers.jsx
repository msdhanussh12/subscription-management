import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../services/customerService';
import CustomerForm from './CustomerForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Building2, 
  Mail, 
  Phone,
  RefreshCw
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = async (searchTerm = debouncedSearch) => {
    try {
      setError('');
      const res = await customerService.getAll(searchTerm);
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(debouncedSearch);
  }, [debouncedSearch]);

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setSelectedCustomer(cust);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, formData);
      } else {
        await customerService.create(formData);
      }
      setFormOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (cust) => {
    setCustomerToDelete(cust);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsSubmitting(true);
    try {
      await customerService.delete(customerToDelete.id);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete customer');
      setDeleteConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Customer Directory</h1>
          <p>Manage customer profiles, contact info, and their active subscriptions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => fetchCustomers()} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={() => fetchCustomers()} onDismiss={() => setError('')} />

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="btn btn-secondary btn-sm"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Table Content */}
      {loading ? (
        <Loading text="Retrieving customer records from database..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No matching customers found' : 'No customers in directory'}
          description={
            search
              ? `No customer matched "${search}". Try searching with a different name, email, or company.`
              : 'Start by creating your first business customer to assign subscription plans.'
          }
          actionLabel={search ? 'Clear Search' : 'Add First Customer'}
          onAction={search ? () => setSearch('') : handleOpenAdd}
        />
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Subscriptions</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    #{cust.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cust.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                      <Mail size={12} />
                      <span>{cust.email}</span>
                    </div>
                  </td>
                  <td>
                    {cust.company ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                        <Building2 size={14} style={{ color: 'var(--brand-400)' }} />
                        <span>{cust.company}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {cust.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Phone size={13} />
                        <span>{cust.phone}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-cycle">
                        {cust.subscription_count} total
                      </span>
                      {cust.active_subscriptions_count > 0 && (
                        <span className="badge badge-active" title="Active subscriptions">
                          <span className="badge-dot" />
                          {cust.active_subscriptions_count} active
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        to={`/customers/${cust.id}`}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="View details & subscriptions"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Edit Customer"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cust)}
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete Customer"
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

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCustomer}
        isSubmitting={isSubmitting}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={
          customerToDelete
            ? `Are you sure you want to delete customer "${customerToDelete.name}"? Active subscriptions will prevent deletion to preserve billing integrity.`
            : ''
        }
        confirmLabel="Delete Customer"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Customers;
