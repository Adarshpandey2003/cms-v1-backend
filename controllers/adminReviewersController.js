const pool   = require('../db');
const bcrypt = require('bcrypt');

exports.listReviewers = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, created_at
         FROM users
        WHERE role = 'reviewer'
        ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err) }
};

exports.createReviewer = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password & name required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users(email, password_hash, role, name)
       VALUES ($1,$2,'reviewer',$3)
       RETURNING id, email, name, role, created_at`,
      [email, hash, name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err) }
};

exports.changePassword = async (req, res, next) => {
  try {
    const reviewerId = Number(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'newPassword required' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const { rows } = await pool.query(
      `UPDATE users
         SET password_hash = $1,
             updated_at    = NOW()
       WHERE id = $2 AND role = 'reviewer'
       RETURNING id, email, name, role, updated_at`,
      [hash, reviewerId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }
    res.json(rows[0]);
  } catch (err) { next(err) }
};
exports.deleteReviewer = async (req, res, next) => {
  try {
    const reviewerId = Number(req.params.id);
    const { rows } = await pool.query(
      `DELETE FROM users
         WHERE id = $1 AND role = 'reviewer'
       RETURNING id`,
      [reviewerId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }
    res.json({ message: 'Reviewer deleted successfully' });
  } catch (err) { next(err) }
};