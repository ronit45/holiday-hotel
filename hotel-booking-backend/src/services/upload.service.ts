import { v2 as cloudinary } from "cloudinary";

class UploadService {
  async uploadImages(imageFiles: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = image.buffer.toString("base64");
      const dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        secure: true, // Force HTTPS URLs
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto:eco", fetch_format: "auto" },
        ],
      });
      return res.secure_url;
    });

    return await Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService();
