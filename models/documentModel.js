// backend/models/documentModel.js
const db = require('../db');

module.exports = {
  async create(data) {
    const { application_id, type, file_url } = data;
    const res = await db.query(
      `INSERT INTO documents (application_id, type, file_url)
       VALUES ($1,$2,$3) RETURNING *`,
      [application_id, type, file_url]
    );
    return res.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const vals = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const res = await db.query(
      `UPDATE documents
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...vals, id]
    );
    return res.rows[0];
  },
};
