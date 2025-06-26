// backend/routes/comments.js
const router = require('express').Router();
const ctrl   = require('../controllers/commentController');
const auth   = require('../middleware/authMiddleware');

router.post('/', auth, ctrl.addComment);

module.exports = router;
