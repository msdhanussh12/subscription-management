import React, { useState, useEffect } from 'react';
import planService from '../services/planService';
import PlanForm from './PlanForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Calendar, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setError('');
      const res = await planService.getAll();
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedPlan) {
        await planService.update(selectedPlan.id, formData);
      } else {
        await planService.create(formData);
      }
      setFormOpen(false);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (plan) => {
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsSubmitting(true);
    try {
      await planService.delete(planToDelete.id);
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete plan');
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Subscription Plans</h1>
          <p>Configure pricing tiers, recurring billing cycles, and feature sets</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchPlans} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchPlans} onDismiss={() => setError('')} />

      {loading ? (
        <Loading text="Loading available subscription tiers..." />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subscription plans created"
          description="Create your first pricing plan so you can assign subscriptions to clients."
          actionLabel="Create First Plan"
          onAction={handleOpenAdd}
        />
      ) : (
        <>
          {/* Plan Cards Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {plans.map((plan) => (
              <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-cycle" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      {plan.billing_cycle}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                      {plan.plan_name}
                    </h3>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    #{plan.id}
                  </span>
                </div>

                <div style={{ margin: '0.5rem 0 1.25rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(plan.price)}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    /{plan.billing_cycle === 'Monthly' ? 'mo' : 'yr'}
                  </span>
                </div>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  flex: 1,
                  marginBottom: '1.5rem'
                }}>
                  {plan.description || 'No plan description provided.'}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {plan.active_subscriptions || 0} active subscriptions
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Edit Plan"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(plan)}
                      className="btn btn-danger btn-icon btn-sm"
                      title="Delete Plan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Plans Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
              All Plans Overview
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plan Name</th>
                    <th>Billing Cycle</th>
                    <th>Price</th>
                    <th>Total Subscriptions</th>
                    <th>Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>#{plan.id}</td>
                      <td style={{ fontWeight: 600 }}>{plan.plan_name}</td>
                      <td>
                        <span className="badge badge-cycle">{plan.billing_cycle}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(plan.price)}</td>
                      <td>{plan.total_subscriptions || 0}</td>
                      <td>
                        <span className="badge badge-active">
                          <span className="badge-dot" />
                          {plan.active_subscriptions || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(plan)}
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Plan Form Modal */}
      <PlanForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPlan}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription Plan"
        message={
          planToDelete
            ? `Are you sure you want to delete plan "${planToDelete.plan_name}"? If any subscriptions reference this plan, the database foreign key safety will block deletion.`
            : ''
        }
        confirmLabel="Delete Plan"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Plans;
