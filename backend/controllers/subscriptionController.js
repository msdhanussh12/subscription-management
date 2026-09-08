const pool = require('../config/db');

// @desc    Get all subscriptions with search and filters
// @route   GET /api/subscriptions
// @access  Private
const getAllSubscriptions = async (req, res, next) => {
  try {
    const { search, status, billingCycle } = req.query;

    let query = `
      SELECT 
        s.id,
        s.customer_id,
        s.plan_id,
        s.start_date,
        s.end_date,
        s.price,
        s.billing_cycle,
        s.status,
        s.created_at,
        s.updated_at,
        c.name AS customer_name,
        c.email AS customer_email,
        c.company AS customer_company,
        p.plan_name,
        p.description AS plan_description
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by search (customer name, customer email, or plan name)
    if (search && search.trim()) {
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ? OR p.plan_name LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter by status (Active, Cancelled, Expired)
    if (status && status !== 'all' && status !== 'All') {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    // Filter by billing cycle (Monthly, Yearly)
    if (billingCycle && billingCycle !== 'all' && billingCycle !== 'All') {
      query += ` AND s.billing_cycle = ?`;
      params.push(billingCycle);
    }

    query += ` ORDER BY s.created_at DESC`;

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

// @desc    Get single subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.id,
        s.customer_id,
        s.plan_id,
        s.start_date,
        s.end_date,
        s.price,
        s.billing_cycle,
        s.status,
        s.created_at,
        s.updated_at,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company AS customer_company,
        c.address AS customer_address,
        p.plan_name,
        p.price AS plan_default_price,
        p.billing_cycle AS plan_billing_cycle,
        p.description AS plan_description
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const row = rows[0];
    const subscription = {
      id: row.id,
      customer_id: row.customer_id,
      plan_id: row.plan_id,
      start_date: row.start_date,
      end_date: row.end_date,
      price: row.price,
      billing_cycle: row.billing_cycle,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      customer: {
        id: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        company: row.customer_company,
        address: row.customer_address
      },
      plan: {
        id: row.plan_id,
        plan_name: row.plan_name,
        price: row.plan_default_price,
        billing_cycle: row.plan_billing_cycle,
        description: row.plan_description
      }
    };

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res, next) => {
  try {
    const { customer_id, plan_id, start_date, end_date, price, billing_cycle, status = 'Active' } = req.body;

    // Verify customer exists
    const [custRows] = await pool.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (custRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected customer not found' });
    }

    // Verify plan exists
    const [planRows] = await pool.query('SELECT id FROM plans WHERE id = ?', [plan_id]);
    if (planRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected plan not found' });
    }

    const [result] = await pool.query(
      `INSERT INTO subscriptions (customer_id, plan_id, start_date, end_date, price, billing_cycle, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, plan_id, start_date, end_date, Number(price), billing_cycle, status]
    );

    // Retrieve the created record joined with details
    const [newSub] = await pool.query(
      `SELECT 
        s.*,
        c.name AS customer_name,
        c.email AS customer_email,
        p.plan_name
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: newSub[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_id, plan_id, start_date, end_date, price, billing_cycle, status } = req.body;

    const [existing] = await pool.query('SELECT id FROM subscriptions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Verify customer exists
    const [custRows] = await pool.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (custRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected customer not found' });
    }

    // Verify plan exists
    const [planRows] = await pool.query('SELECT id FROM plans WHERE id = ?', [plan_id]);
    if (planRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected plan not found' });
    }

    await pool.query(
      `UPDATE subscriptions 
       SET customer_id = ?, plan_id = ?, start_date = ?, end_date = ?, price = ?, billing_cycle = ?, status = ?
       WHERE id = ?`,
      [customer_id, plan_id, start_date, end_date, Number(price), billing_cycle, status, id]
    );

    const [updated] = await pool.query(
      `SELECT 
        s.*,
        c.name AS customer_name,
        c.email AS customer_email,
        p.plan_name
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change subscription status
// @route   PATCH /api/subscriptions/:id/status
// @access  Private
const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [existing] = await pool.query('SELECT id, status FROM subscriptions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await pool.query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);

    res.status(200).json({
      success: true,
      message: `Subscription status updated to ${status}`,
      data: { id: Number(id), status }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM subscriptions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  updateSubscriptionStatus,
  deleteSubscription
};
