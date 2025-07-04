const express = require('express');
const auth        = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl        = require('../controllers/adminReviewersController');

const router = express.Router();

// only review_admins:
router.use(auth, requireRole('review_admin'));

router.get('/',           ctrl.listReviewers);
router.post('/',          ctrl.createReviewer);
router.patch('/:id/password', ctrl.changePassword);
module.exports = router;
