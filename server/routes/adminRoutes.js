const express = require('express');
const router = express.Router();
const {
  getStats, getAllUsers, toggleUser, verifyHelper,
  getCategories, createCategory, toggleCategory, deleteCategory, getAllJobs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUser);
router.patch('/helpers/:userId/verify', verifyHelper);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id/toggle', toggleCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/jobs', getAllJobs);

module.exports = router;
