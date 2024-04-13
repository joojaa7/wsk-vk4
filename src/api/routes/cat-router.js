import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { authenticateToken, createThumbnail, validationErrors } from '../../middlewares.js';
import {
  deleteCat,
  getCat,
  getCatById,
  postCat,
  putCat,
} from '../controllers/cat-controller.js';

const catRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // TODO fix spaces in filenames, we do not want to save files with spaces
    const originalFilename = file.originalname.split('.')[0].toLowerCase();
    const prefix = `${originalFilename}-${file.fieldname}`;

    let extension = 'jpg';

    if (file.mimetype === 'image/png') {
      extension = 'png';
    }

    // console.log("file in storage", file)

    const filename = `${prefix}-${suffix}.${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  // diskStorage destination property overwrites dest prop
  dest: 'uploads/',
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true)
    } else {
      const error = new Error("Only images and videos are supported.")
      error.status = 400
      cb(error)
    }
  }
});

catRouter
  .route('/')
  .get(getCat)
  .post(
    authenticateToken,
    upload.single('file'),
    body("cat_name").trim().isLength({ min: 3, max: 30 }),
    validationErrors,
    createThumbnail,
    postCat
  );

catRouter
  .route('/:id')
  .get(getCatById)
  .put(authenticateToken, putCat)
  .delete(authenticateToken, deleteCat);

export default catRouter;
