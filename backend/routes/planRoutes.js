const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planController');
const authenticateToken = require('../middleware/authMiddleware');
const { validatePlan } = require('../middleware/validationMiddleware');

// All plan routes are protected
router.use(authenticateToken);

router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.post('/', validatePlan, createPlan);
router.put('/:id', validatePlan, updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
