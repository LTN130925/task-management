import { Request, Response, NextFunction } from 'express';

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadCloud = {
  upload: (req: MulterRequest, res: Response, next: NextFunction) => {
    if (req.file) {
      let streamUpload = (req: MulterRequest) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      async function upload(req: MulterRequest) {
        let result: any = await streamUpload(req);
        req.body[req.file.fieldname] = result.url;
        next();
      }

      upload(req);
    } else {
      next();
    }
  },
};
