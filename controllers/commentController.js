// backend/controllers/commentController.js
const Comment = require('../models/commentModel');

exports.addComment = async (req, res, next) => {
  try {
    const c = await Comment.create(req.body);
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
};
