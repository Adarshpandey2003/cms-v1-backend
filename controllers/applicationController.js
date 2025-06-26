// backend/controllers/applicationController.js
const Application = require('../models/applicationModel');
const db = require('../db');
const pool = require('../db');
exports.listApplications = async (req, res, next) => {
  try {
    const rows = await Application.list(req.query.status);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ error: 'Not found' });

    const [docsRes, commRes] = await Promise.all([
      db.query(
        'SELECT * FROM documents WHERE application_id = $1 ORDER BY created_at',
        [id]
      ),
      db.query(
        `SELECT c.*, u.name AS author
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.application_id = $1
         ORDER BY c.created_at`,
        [id]
      ),
    ]);

    res.json({
      application: app,
      documents: docsRes.rows,
      comments: commRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const app = await Application.create(req.body);
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  const id = Number(req.params.id);
  const fields = [];
  const params = [];

  ['student_name','mobile','email','country','state','university','course_name','course_url','status']
    .forEach(key => {
      if (req.body[key] !== undefined) {
        params.push(req.body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    });

  if (!fields.length) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  fields.push('updated_at = NOW()');
  params.push(id);

  const sql = `
    UPDATE applications
      SET ${fields.join(', ')}
    WHERE id = $${params.length}
    RETURNING *;`;
  try {
    const { rows } = await pool.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
};

exports.deleteApplication = async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    // verify it exists
    const { rows } = await pool.query(
      'SELECT id FROM applications WHERE id = $1',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }
    // delete it
    await pool.query(
      'DELETE FROM applications WHERE id = $1',
      [id]
    );
    // no content
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};