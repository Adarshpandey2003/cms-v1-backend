// backend/models/applicationModel.js
const db = require('../db');

module.exports = {
  async list(status) {
    if (status) {
      const res = await db.query(
        'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC',
        [status]
      );
      return res.rows;
    }
    const res = await db.query(
      'SELECT * FROM applications ORDER BY created_at DESC'
    );
    return res.rows;
  },

  async findById(id) {
    const res = await db.query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );
    return res.rows[0];
  },

  async create(data) {
    const {
      agent_id,
      student_name,
      mobile,
      email,
      country,
      state,
      university,
      course_name,
      course_url,
    } = data;
    const res = await db.query(
      `INSERT INTO applications
       (agent_id, student_name, mobile, email, country, state, university, course_name, course_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        agent_id,
        student_name,
        mobile,
        email,
        country,
        state,
        university,
        course_name,
        course_url,
      ]
    );
    return res.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const vals = Object.values(fields);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const res = await db.query(
      `UPDATE applications
       SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING *`,
      [...vals, id]
    );
    return res.rows[0];
  },
};
