// backend/controllers/documentController.js
const fs   = require('fs');
const path = require('path');
const db   = require('../db'); // Assuming db.js exports a configured pg Pool instance

/**
 * List all documents (optionally filter by application_id via ?application_id=)
 */
exports.listDocuments = async (req, res, next) => {
  try {
    const { application_id } = req.query;
    let sql = 'SELECT * FROM documents';
    const params = [];
    if (application_id) {
      params.push(application_id);
      sql += ` WHERE application_id = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single document by :id
 */
exports.getDocument = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Document not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Upload a new document:
 * Expects multipart form:
 *  - file field named "file"
 *  - text fields "application_id" and "type"
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    const { application_id, type } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Build URL to serve it back
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const { rows } = await db.query(
      `INSERT INTO documents
         (application_id, type, file_url, status)
       VALUES ($1,$2,$3,'pending')
       RETURNING *`,
      [application_id, type, fileUrl]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Patch a document: you can update status and/or add a comment
 *
 * Body may contain:
 *   { status: 'approved'|'rejected'|'pending', comment: '...' }
 */
exports.updateDocument = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const fields = [];
    const params = [];
    if (req.body.status) {
      params.push(req.body.status);
      fields.push(`status = $${params.length}`);
    }
    if (typeof req.body.comment === 'string') {
      params.push(req.body.comment);
      fields.push(`comment = $${params.length}`);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    // update timestamp too
    fields.push(`updated_at = NOW()`);

    const sql = `
      UPDATE documents
         SET ${fields.join(', ')}
       WHERE id = $${params.length + 1}
       RETURNING *
    `;
    params.push(id);

    const { rows } = await db.query(sql, params);
    if (!rows[0]) return res.status(404).json({ error: 'Document not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a document row AND its file from disk
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // fetch row first so we know the filename
    const { rows } = await db.query(
      'SELECT file_url FROM documents WHERE id = $1',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Document not found' });

    // strip host part and URL-decode
    const fileUrl = new URL(rows[0].file_url);
    const filePath = path.join(
      __dirname, '../uploads', path.basename(fileUrl.pathname)
    );

    // delete the DB row
    await db.query('DELETE FROM documents WHERE id = $1', [id]);

    // remove the file if it exists
    fs.unlink(filePath, (err) => {
      // ignore ENOENT or other unlink errors
      if (err && err.code !== 'ENOENT') console.error('failed to delete file', err);
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
