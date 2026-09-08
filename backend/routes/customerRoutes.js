const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const authenticateToken = require('../middleware/authMiddleware');
const { validateCustomer } = require('../middleware/validationMiddleware');

// All customer routes are protected
router.use(authenticateToken);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', validateCustomer, createCustomer);
router.put('/:id', validateCustomer, updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
