const pool = require('../config/db');

// @desc    Get all subscription plans
// @route   GET /api/plans
// @access  Private
const getAllPlans = async (req, res, next) => {
  try {
    const [plans] = await pool.query(`
      SELECT 
        p.id,
        p.plan_name,
        p.price,
        p.billing_cycle,
        p.description,
        p.created_at,
        p.updated_at,
        COUNT(s.id) AS total_subscriptions,
        SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) AS active_subscriptions
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      GROUP BY p.id
      ORDER BY p.price ASC
    `);

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan by ID
// @route   GET /api/plans/:id
// @access  Private
const getPlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subscription plan
// @route   POST /api/plans
// @access  Private
const createPlan = async (req, res, next) => {
  try {
    const { plan_name, price, billing_cycle, description } = req.body;

    const [result] = await pool.query(
      'INSERT INTO plans (plan_name, price, billing_cycle, description) VALUES (?, ?, ?, ?)',
      [plan_name.trim(), Number(price), billing_cycle, description ? description.trim() : null]
    );

    const [newPlan] = await pool.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: newPlan[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription plan
// @route   PUT /api/plans/:id
// @access  Private
const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan_name, price, billing_cycle, description } = req.body;

    const [existing] = await pool.query('SELECT id FROM plans WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await pool.query(
      'UPDATE plans SET plan_name = ?, price = ?, billing_cycle = ?, description = ? WHERE id = ?',
      [plan_name.trim(), Number(price), billing_cycle, description ? description.trim() : null, id]
    );

    const [updatedPlan] = await pool.query('SELECT * FROM plans WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: updatedPlan[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription plan
// @route   DELETE /api/plans/:id
// @access  Private
const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, plan_name FROM plans WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if any subscriptions reference this plan
    const [subCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM subscriptions WHERE plan_id = ?',
      [id]
    );

    if (subCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan "${existing[0].plan_name}" because it is currently referenced by ${subCount[0].count} subscription(s).`
      });
    }

    await pool.query('DELETE FROM plans WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
