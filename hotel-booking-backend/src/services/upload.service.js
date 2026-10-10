import { v2 as cloudinary } from "cloudinary";

class UploadService {
  uploadImages(imageFiles) {
    return Promise.all(imageFiles.map(async (img) => {
      const res = await cloudinary.uploader.upload(`data:${img.mimetype};base64,${img.buffer.toString("base64")}`, {
        secure: true,
        transformation: [{ width: 800, height: 600, crop: "fill" }, { quality: "auto:eco", fetch_format: "auto" }],
      });
      return res.secure_url;
    }));
  }
}

export const uploadService = new UploadService();
