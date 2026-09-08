const pool = require('../config/db');

// @desc    Get all customers with optional search and subscription counts
// @route   GET /api/customers
// @access  Private
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.email, 
        c.phone, 
        c.company, 
        c.address, 
        c.created_at, 
        c.updated_at,
        COUNT(s.id) AS subscription_count,
        SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) AS active_subscriptions_count
      FROM customers c
      LEFT JOIN subscriptions s ON c.id = s.customer_id
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` WHERE c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ?`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer by ID along with their subscriptions
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's subscriptions joined with plan details
    const [subscriptions] = await pool.query(
      `SELECT 
        s.id,
        s.start_date,
        s.end_date,
        s.price,
        s.billing_cycle,
        s.status,
        s.created_at,
        p.id AS plan_id,
        p.plan_name,
        p.description AS plan_description
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...customers[0],
        subscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address } = req.body;

    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, company, address) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), phone ? phone.trim() : null, company ? company.trim() : null, address ? address.trim() : null]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address } = req.body;

    const [existing] = await pool.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await pool.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?',
      [name.trim(), email.trim(), phone ? phone.trim() : null, company ? company.trim() : null, address ? address.trim() : null, id]
    );

    const [updatedCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has active subscriptions
    const [activeSubs] = await pool.query(
      "SELECT COUNT(*) AS count FROM subscriptions WHERE customer_id = ? AND status = 'Active'",
      [id]
    );

    if (activeSubs[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer "${existing[0].name}" because they have ${activeSubs[0].count} active subscription(s). Please cancel or expire them first.`
      });
    }

    // Check if there are any subscriptions at all (history)
    const [allSubs] = await pool.query(
      'SELECT COUNT(*) AS count FROM subscriptions WHERE customer_id = ?',
      [id]
    );

    if (allSubs[0].count > 0) {
      // Clean up past cancelled/expired subscriptions or notify
      // Since foreign key constraint is RESTRICT, we can either cascade or prevent:
      // Deleting past records with the customer allows clean removal if intended
      await pool.query('DELETE FROM subscriptions WHERE customer_id = ?', [id]);
    }

    await pool.query('DELETE FROM customers WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
