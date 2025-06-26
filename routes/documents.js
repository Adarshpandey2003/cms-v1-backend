// backend/routes/documents.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const auth    = require('../middleware/authMiddleware');
const ctrl    = require('../controllers/documentController');

const router = express.Router();

// configure multer to write into backend/uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    // prepend timestamp to avoid collisions
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// list all documents
router.get('/',    auth, ctrl.listDocuments);
// get one document by id
router.get('/:id', auth, ctrl.getDocument);

// upload a new document file
// expects multipart/form-data:
//   - field "file": the file itself
//   - fields "application_id" and "type" in the body
router.post(
  '/',
  auth,
  upload.single('file'),
  ctrl.uploadDocument
);

// update status or comment
router.patch('/:id', auth, ctrl.updateDocument);

// delete a document (and its file)
router.delete('/:id', auth, ctrl.deleteDocument);

module.exports = router;
