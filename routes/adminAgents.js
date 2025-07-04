const express = require('express');
const auth        = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const ctrl        = require('../controllers/adminAgentsController');

const router = express.Router();

// All routes below require an authenticated agent_admin
router.use(auth, requireRole('agent_admin'));

// GET   /api/admin/agents            → list all agents
router.get('/',             ctrl.listAgents);

// POST  /api/admin/agents           → create new agent account
router.post('/',            ctrl.createAgent);

// PATCH /api/admin/agents/:id/password → change that agent’s password
router.patch('/:id/password', ctrl.changePassword);

module.exports = router;
