// backend/models/commentModel.js
const db = require('../db');

module.exports = {
  async create(data) {
    const { application_id, document_id, user_id, text } = data;
    const res = await db.query(
      `INSERT INTO comments (application_id, document_id, user_id, text)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [application_id, document_id, user_id, text]
    );
    return res.rows[0];
  },
};
