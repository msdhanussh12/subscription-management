import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import customerService from '../services/customerService';
import planService from '../services/planService';

const SubscriptionForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    price: '',
    billing_cycle: 'Monthly',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  // Helper to compute default end date
  const computeEndDate = (startDateStr, cycle) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';
    if (cycle === 'Yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  // Load customers and plans for selection
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setLoadingLookups(true);
        try {
          const [custRes, planRes] = await Promise.all([
            customerService.getAll(),
            planService.getAll()
          ]);
          if (custRes.success) setCustomers(custRes.data);
          if (planRes.success) setPlans(planRes.data);
        } catch (err) {
          console.error('Failed to load customers or plans for form', err);
        } finally {
          setLoadingLookups(false);
        }
      };
      loadData();
    }
  }, [isOpen]);

  // Set initial form state
  useEffect(() => {
    if (initialData) {
      const start = initialData.start_date ? initialData.start_date.split('T')[0] : '';
      const end = initialData.end_date ? initialData.end_date.split('T')[0] : '';
      setFormData({
        customer_id: initialData.customer_id || '',
        plan_id: initialData.plan_id || '',
        start_date: start,
        end_date: end,
        price: initialData.price || '',
        billing_cycle: initialData.billing_cycle || 'Monthly',
        status: initialData.status || 'Active'
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        customer_id: '',
        plan_id: '',
        start_date: today,
        end_date: computeEndDate(today, 'Monthly'),
        price: '',
        billing_cycle: 'Monthly',
        status: 'Active'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle plan change: auto-populate price and billing cycle
  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const plan = plans.find((p) => String(p.id) === String(selectedPlanId));

    if (plan) {
      const newCycle = plan.billing_cycle;
      const newEndDate = computeEndDate(formData.start_date, newCycle);
      setFormData((prev) => ({
        ...prev,
        plan_id: selectedPlanId,
        price: plan.price,
        billing_cycle: newCycle,
        end_date: newEndDate
      }));
    } else {
      setFormData((prev) => ({ ...prev, plan_id: selectedPlanId }));
    }

    if (errors.plan_id) setErrors((prev) => ({ ...prev, plan_id: '' }));
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    const newEnd = computeEndDate(newStart, formData.billing_cycle);
    setFormData((prev) => ({
      ...prev,
      start_date: newStart,
      end_date: newEnd
    }));
    if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: '' }));
  };

  const handleCycleChange = (e) => {
    const newCycle = e.target.value;
    const newEnd = computeEndDate(formData.start_date, newCycle);
    setFormData((prev) => ({
      ...prev,
      billing_cycle: newCycle,
      end_date: newEnd
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.customer_id) {
      errs.customer_id = 'Please select a customer';
    }

    if (!formData.plan_id) {
      errs.plan_id = 'Please select a plan';
    }

    if (!formData.start_date) {
      errs.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errs.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      errs.end_date = 'End date cannot be earlier than start date';
    }

    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      errs.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errs.price = 'Price must be a valid positive number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      customer_id: Number(formData.customer_id),
      plan_id: Number(formData.plan_id),
      price: Number(formData.price)
    });
  };

  const title = initialData ? 'Edit Subscription' : 'Create Customer Subscription';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="600px">
      <form onSubmit={handleSubmit} noValidate>
        {/* Customer selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="sub-customer">
            Customer *
          </label>
          <select
            id="sub-customer"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className={`form-select ${errors.customer_id ? 'error' : ''}`}
            disabled={loadingLookups}
            required
          >
            <option value="">-- Choose a Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''} - {c.email}
              </option>
            ))}
          </select>
          {errors.customer_id && <span className="form-error">{errors.customer_id}</span>}
        </div>

        {/* Plan selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="sub-plan">
            Subscription Plan * (Auto-fills price & cycle)
          </label>
          <select
            id="sub-plan"
            name="plan_id"
            value={formData.plan_id}
            onChange={handlePlanChange}
            className={`form-select ${errors.plan_id ? 'error' : ''}`}
            disabled={loadingLookups}
            required
          >
            <option value="">-- Choose a Subscription Plan --</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plan_name} - ₹{p.price} ({p.billing_cycle})
              </option>
            ))}
          </select>
          {errors.plan_id && <span className="form-error">{errors.plan_id}</span>}
        </div>

        {/* Start Date and End Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="sub-start-date">
              Start Date *
            </label>
            <input
              id="sub-start-date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleStartDateChange}
              className={`form-input ${errors.start_date ? 'error' : ''}`}
              required
            />
            {errors.start_date && <span className="form-error">{errors.start_date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sub-end-date">
              End Date *
            </label>
            <input
              id="sub-end-date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`form-input ${errors.end_date ? 'error' : ''}`}
              required
            />
            {errors.end_date && <span className="form-error">{errors.end_date}</span>}
          </div>
        </div>

        {/* Price, Billing Cycle, Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="sub-price">
              Price (₹) *
            </label>
            <input
              id="sub-price"
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`form-input ${errors.price ? 'error' : ''}`}
              required
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sub-cycle">
              Cycle *
            </label>
            <select
              id="sub-cycle"
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleCycleChange}
              className="form-select"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sub-status">
              Status *
            </label>
            <select
              id="sub-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Subscription' : 'Create Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubscriptionForm;
