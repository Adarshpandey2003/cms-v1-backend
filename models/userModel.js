// backend/models/userModel.js
const db = require('../db');

module.exports = {
  async findByEmail(email) {
    const result = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },
};
