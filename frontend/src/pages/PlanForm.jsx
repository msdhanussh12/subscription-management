import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const PlanForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    plan_name: '',
    price: '',
    billing_cycle: 'Monthly',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        plan_name: initialData.plan_name || '',
        price: initialData.price || '',
        billing_cycle: initialData.billing_cycle || 'Monthly',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        plan_name: '',
        price: '',
        billing_cycle: 'Monthly',
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.plan_name.trim()) {
      errs.plan_name = 'Plan name is required';
    }

    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      errs.price = 'Price is required';
    } else if (isNaN(Number(formData.price))) {
      errs.price = 'Price must be a valid number';
    } else if (Number(formData.price) < 0) {
      errs.price = 'Price cannot be negative';
    }

    if (!['Monthly', 'Yearly'].includes(formData.billing_cycle)) {
      errs.billing_cycle = 'Select Monthly or Yearly';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      price: Number(formData.price)
    });
  };

  const title = initialData ? 'Edit Subscription Plan' : 'Create Subscription Plan';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="520px">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="plan_name">
            Plan Name *
          </label>
          <input
            id="plan_name"
            type="text"
            name="plan_name"
            value={formData.plan_name}
            onChange={handleChange}
            placeholder="e.g. Professional Growth"
            className={`form-input ${errors.plan_name ? 'error' : ''}`}
            required
          />
          {errors.plan_name && <span className="form-error">{errors.plan_name}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="plan_price">
              Price (₹) *
            </label>
            <input
              id="plan_price"
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="1499.00"
              className={`form-input ${errors.price ? 'error' : ''}`}
              required
            />
            {errors.price && <span className="form-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="plan_billing_cycle">
              Billing Cycle *
            </label>
            <select
              id="plan_billing_cycle"
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
            {errors.billing_cycle && <span className="form-error">{errors.billing_cycle}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="plan_description">
            Plan Description
          </label>
          <textarea
            id="plan_description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Key features, user limits, or SLA details included in this plan..."
            className="form-textarea"
          />
        </div>

        <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlanForm;
