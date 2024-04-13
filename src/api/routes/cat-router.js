import express from 'express';
import multer from 'multer';
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

    const originalFilename = file.originalname.split('.')[0].toLowerCase();
    const prefix = `${originalFilename}-${file.fieldname}`;

    let extension = 'jpg';

    if (file.mimetype === 'image/png') {
      extension = 'png';
    }


    const filename = `${prefix}-${suffix}.${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
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
    upload.single('file'),
    postCat
  );

catRouter
  .route('/:id')
  .get(getCatById)
  .put(putCat)
  .delete(deleteCat);

export default catRouter;
