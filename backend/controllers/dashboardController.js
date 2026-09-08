const pool = require('../config/db');

// @desc    Get dashboard metrics, statistics, MRR, and status distribution
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Customers
    const [custResult] = await pool.query('SELECT COUNT(*) AS totalCustomers FROM customers');
    const totalCustomers = custResult[0].totalCustomers;

    // 2. Subscription counts & status breakdown
    const [statusResult] = await pool.query(`
      SELECT 
        COUNT(*) AS totalSubscriptions,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS activeSubscriptions,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledSubscriptions,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) AS expiredSubscriptions
      FROM subscriptions
    `);

    const totalSubscriptions = Number(statusResult[0].totalSubscriptions) || 0;
    const activeSubscriptions = Number(statusResult[0].activeSubscriptions) || 0;
    const cancelledSubscriptions = Number(statusResult[0].cancelledSubscriptions) || 0;
    const expiredSubscriptions = Number(statusResult[0].expiredSubscriptions) || 0;

    // 3. MRR Calculation strictly from database records:
    // Monthly: full price
    // Yearly: price / 12
    // Only from Active subscriptions
    const [mrrResult] = await pool.query(`
      SELECT 
        COALESCE(
          SUM(
            CASE 
              WHEN billing_cycle = 'Monthly' THEN price 
              WHEN billing_cycle = 'Yearly' THEN price / 12.0 
              ELSE 0 
            END
          ), 
          0
        ) AS mrr
      FROM subscriptions
      WHERE status = 'Active'
    `);

    const mrr = Number(Number(mrrResult[0].mrr).toFixed(2));

    // 4. Status breakdown array for charts
    const subscriptionStatus = {
      active: activeSubscriptions,
      cancelled: cancelledSubscriptions,
      expired: expiredSubscriptions
    };

    // 5. Recent Subscriptions (latest 5 with joined customer and plan)
    const [recentSubscriptions] = await pool.query(`
      SELECT 
        s.id,
        s.start_date,
        s.end_date,
        s.price,
        s.billing_cycle,
        s.status,
        s.created_at,
        c.name AS customer_name,
        c.email AS customer_email,
        p.plan_name
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        expiredSubscriptions,
        mrr,
        subscriptionStatus,
        recentSubscriptions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
