const db = require('../db');

exports.reassignApplication = async (req, res, next) => {
  try {
    const appId   = Number(req.params.id);
    const { agent_id } = req.body;
    if (!agent_id) {
      return res.status(400).json({ error: 'New agent_id required' });
    }
    const { rows } = await db.query(
      `UPDATE applications
          SET agent_id   = $1,
              updated_at = NOW()
        WHERE id = $2
        RETURNING id, agent_id, status, updated_at`,
      [agent_id, appId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(rows[0]);
  } catch (err) { next(err); }
};

exports.reassignReviewer = async (req, res, next) => {
  try {
    const appId       = Number(req.params.id);
    const { reviewer_id } = req.body;
    if (!reviewer_id) {
      return res.status(400).json({ error: 'reviewer_id required' });
    }
    const { rows } = await pool.query(
      `UPDATE applications
         SET reviewer_id = $1,
             updated_at   = NOW()
       WHERE id = $2
       RETURNING id, agent_id, reviewer_id, status, updated_at`,
      [reviewer_id, appId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(rows[0]);
  } catch (err) { next(err) }
};
