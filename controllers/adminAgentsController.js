
const db       = require('../db');
const bcrypt   = require('bcrypt');

exports.listAgents = async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name,email, role, created_at
         FROM users
        WHERE role = 'agent'
        ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users(email, password_hash, role)
       VALUES ($1, $2, 'agent')
       RETURNING id, email, role, created_at`,
      [email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const agentId = Number(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password required' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const { rows } = await db.query(
      `UPDATE users
          SET password_hash = $1,
              updated_at    = NOW()
        WHERE id = $2 AND role = 'agent'
        RETURNING id, email, role, updated_at`,
      [hash, agentId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(rows[0]);
  } catch (err) { next(err); }
};
