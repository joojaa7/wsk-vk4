import 'dotenv/config';
import { validationResult } from 'express-validator';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';

const createThumbnail = (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  const [filename, extension] = req.file.filename.split('.');

  sharp(req.file.path)
    .resize(160, 160)
    .png()
    .toFile(`${req.file.destination}/${filename}_thumb.${extension}`)
    .then(() => next());
};

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token', token);
  if (token == null) {
    return res.sendStatus(401);
  }
  try {
    res.locals.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).send({ message: 'invalid token' });
  }
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.originalUrl}`)
  error.status = 404

  next(error)
}

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    status: res.status || 500
  })
}

const validationErrors = (req, res, next) => {
  const errors = validationResult(req)

  console.log("req.file", req.file)
  //console.log("req in validation", req)

  if (!errors.isEmpty()) {
    // if file exists, remove it
    // validator must be after multer upload
    // TODO add check that file exists and is within the correct folder
    if (req.file) {
      console.log("file", `uploads/${req.file.filename}`)
      fs.unlinkSync(`uploads/${req.file.filename}`)
    }

    const messages = errors.array().map(error => `${error.path}: ${error.msg}`).join(", ")
    const error = new Error(messages)
    error.status = 400
    next(error)

    return
  }

  next()
}

export {
  authenticateToken, createThumbnail, errorHandler, notFoundHandler, validationErrors
};
