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


export { createThumbnail };
