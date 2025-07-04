const express = require('express');
const auth        = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl        = require('../controllers/adminApplicationsController');

const router = express.Router();

// Only agent_admin can reassign
router.use(auth, requireRole('agent_admin'));

// PATCH /api/admin/applications/:id/assign
router.patch('/:id/assign', ctrl.reassignApplication);

router.use(auth, requireRole('review_admin'));
router.patch('/:id/assign-reviewer', ctrl.reassignReviewer);

module.exports = router;
