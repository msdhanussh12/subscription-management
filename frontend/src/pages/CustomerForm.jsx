import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const CustomerForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        address: initialData.address || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Customer name is required';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Name cannot exceed 100 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email is required';
    }

    if (formData.phone && formData.phone.trim()) {
      if (!/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(formData.phone.trim())) {
        errs.phone = 'Invalid phone number format';
      }
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
    onSubmit(formData);
  };

  const title = initialData ? 'Edit Customer' : 'Add New Customer';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="560px">
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="customer-name">
            Customer Name *
          </label>
          <input
            id="customer-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Alice Walker"
            className={`form-input ${errors.name ? 'error' : ''}`}
            required
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-email">
            Email Address *
          </label>
          <input
            id="customer-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. alice@company.com"
            className={`form-input ${errors.email ? 'error' : ''}`}
            required
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="customer-phone">
              Phone Number
            </label>
            <input
              id="customer-phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555-0199"
              className={`form-input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="customer-company">
              Company
            </label>
            <input
              id="customer-company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Innovate Tech LLC"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customer-address">
            Address
          </label>
          <textarea
            id="customer-address"
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, city, state, zip..."
            className="form-textarea"
          />
        </div>

        <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
