// backend/controllers/authController.js
const db         = require('../db');
const jwt        = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      `SELECT id, name, email, role, password_hash,
              (crypt($1, password_hash) = password_hash) AS valid
       FROM users WHERE email = $2`,
      [password, email]
    );

    const user = result.rows[0];
    if (!user || !user.valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign a JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return token + user info
    const { password_hash, valid, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
};
