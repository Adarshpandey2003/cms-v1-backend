// backend/routes/applications.js
const router = require('express').Router();
const ctrl   = require('../controllers/applicationController');
const auth   = require('../middleware/authMiddleware');

router.get('/',    auth, ctrl.listApplications);
router.post('/',   auth, ctrl.createApplication);
router.get('/:id', auth, ctrl.getApplication);
router.patch('/:id', auth, ctrl.updateApplication);
router.delete('/:id', auth, ctrl.deleteApplication);
module.exports = router;
