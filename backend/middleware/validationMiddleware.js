// Email format regular expression
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;

// 1. Auth Validation
const validateSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Invalid email address format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

// 2. Customer Validation
const validateCustomer = (req, res, next) => {
  const { name, email, phone, company, address } = req.body;
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Customer name is required';
  } else if (name.trim().length > 100) {
    errors.name = 'Customer name cannot exceed 100 characters';
  }

  if (!email || !email.trim()) {
    errors.email = 'Customer email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Invalid email address';
  } else if (email.trim().length > 150) {
    errors.email = 'Email cannot exceed 150 characters';
  }

  if (phone && phone.trim()) {
    if (!PHONE_REGEX.test(phone.trim())) {
      errors.phone = 'Invalid phone number format';
    } else if (phone.trim().length > 30) {
      errors.phone = 'Phone number cannot exceed 30 characters';
    }
  }

  if (company && company.trim().length > 150) {
    errors.company = 'Company name cannot exceed 150 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Customer validation failed', errors });
  }

  next();
};

// 3. Plan Validation
const validatePlan = (req, res, next) => {
  const { plan_name, price, billing_cycle, description } = req.body;
  const errors = {};

  if (!plan_name || !plan_name.trim()) {
    errors.plan_name = 'Plan name is required';
  } else if (plan_name.trim().length > 100) {
    errors.plan_name = 'Plan name cannot exceed 100 characters';
  }

  if (price === undefined || price === null || price === '') {
    errors.price = 'Price is required';
  } else {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      errors.price = 'Price must be a valid number';
    } else if (numPrice < 0) {
      errors.price = 'Price cannot be negative';
    }
  }

  if (!billing_cycle) {
    errors.billing_cycle = 'Billing cycle is required';
  } else if (!['Monthly', 'Yearly'].includes(billing_cycle)) {
    errors.billing_cycle = 'Billing cycle must be either Monthly or Yearly';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Plan validation failed', errors });
  }

  next();
};

// 4. Subscription Validation
const validateSubscription = (req, res, next) => {
  const { customer_id, plan_id, start_date, end_date, price, billing_cycle, status } = req.body;
  const errors = {};

  if (!customer_id) {
    errors.customer_id = 'Customer selection is required';
  } else if (isNaN(Number(customer_id))) {
    errors.customer_id = 'Invalid customer ID';
  }

  if (!plan_id) {
    errors.plan_id = 'Plan selection is required';
  } else if (isNaN(Number(plan_id))) {
    errors.plan_id = 'Invalid plan ID';
  }

  if (!start_date) {
    errors.start_date = 'Start date is required';
  } else if (isNaN(Date.parse(start_date))) {
    errors.start_date = 'Invalid start date';
  }

  if (!end_date) {
    errors.end_date = 'End date is required';
  } else if (isNaN(Date.parse(end_date))) {
    errors.end_date = 'Invalid end date';
  }

  if (start_date && end_date && !errors.start_date && !errors.end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end < start) {
      errors.end_date = 'End date cannot be earlier than start date';
    }
  }

  if (price === undefined || price === null || price === '') {
    errors.price = 'Price is required';
  } else {
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      errors.price = 'Price must be a valid number';
    } else if (numPrice < 0) {
      errors.price = 'Price cannot be negative';
    }
  }

  if (!billing_cycle) {
    errors.billing_cycle = 'Billing cycle is required';
  } else if (!['Monthly', 'Yearly'].includes(billing_cycle)) {
    errors.billing_cycle = 'Billing cycle must be either Monthly or Yearly';
  }

  if (status && !['Active', 'Cancelled', 'Expired'].includes(status)) {
    errors.status = 'Status must be Active, Cancelled, or Expired';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Subscription validation failed', errors });
  }

  next();
};

const validateSubscriptionStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  if (!['Active', 'Cancelled', 'Expired'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be Active, Cancelled, or Expired'
    });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateCustomer,
  validatePlan,
  validateSubscription,
  validateSubscriptionStatus
};
