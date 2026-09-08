const express = require('express');
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  updateSubscriptionStatus,
  deleteSubscription
} = require('../controllers/subscriptionController');
const authenticateToken = require('../middleware/authMiddleware');
const {
  validateSubscription,
  validateSubscriptionStatus
} = require('../middleware/validationMiddleware');

// All subscription routes are protected
router.use(authenticateToken);

router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', validateSubscription, createSubscription);
router.put('/:id', validateSubscription, updateSubscription);
router.patch('/:id/status', validateSubscriptionStatus, updateSubscriptionStatus);
router.delete('/:id', deleteSubscription);

module.exports = router;
