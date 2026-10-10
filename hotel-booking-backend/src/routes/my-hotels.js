import express from "express";
import multer from "multer";
import verifyToken from "../middleware/auth.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { uploadService } from "../services/upload.service.js";
import { hotelService } from "../services/hotel.service.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")) });

router.post("/", verifyToken, requireAdmin, upload.array("imageFiles", 6), async (req, res) => {
  const data = {
    ...req.body,
    userId: req.userId,
    lastUpdated: new Date(),
    contact: { phone: req.body["contact.phone"] || "", email: req.body["contact.email"] || "", website: req.body["contact.website"] || "" },
    imageUrls: await uploadService.uploadImages(req.files || [])
  };
  res.status(201).json(await hotelService.createHotel(data));
});

router.get("/", verifyToken, requireAdmin, async (req, res) => {
  res.json(await hotelService.getMyHotels(req.userId));
});

router.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  res.json(await hotelService.getMyHotelById(req.params.id, req.userId));
});

router.patch("/:id/active", verifyToken, requireAdmin, async (req, res) => {
  if (typeof req.body?.isActive !== "boolean") return res.status(400).json({ message: "isActive required" });
  const hotel = await hotelService.toggleHotelActive(req.params.id, req.body.isActive, req.userId);
  hotel ? res.json(hotel) : res.status(404).json({ message: "Hotel not found" });
});

router.put("/:hotelId", verifyToken, requireAdmin, upload.array("imageFiles"), async (req, res) => {
  const existing = await hotelService.getMyHotelById(req.params.hotelId, req.userId);
  if (!existing) return res.status(404).json({ message: "Hotel not found" });

  const existingImageUrls = [].concat(req.body.imageUrls || []);
  const newImageUrls = req.files?.length ? await uploadService.uploadImages(req.files) : [];

  const updateData = {
    ...req.body,
    pricePerNight: Number(req.body.pricePerNight),
    starRating: Number(req.body.starRating),
    adultCount: Number(req.body.adultCount),
    childCount: Number(req.body.childCount),
    facilities: [].concat(req.body.facilities || []),
    contact: { phone: req.body["contact.phone"] || "", email: req.body["contact.email"] || "", website: req.body["contact.website"] || "" },
    imageUrls: [...newImageUrls, ...existingImageUrls],
    lastUpdated: new Date()
  };

  const hotel = await hotelService.updateHotel(req.params.hotelId, req.userId, updateData);
  hotel ? res.status(200).json(hotel) : res.status(404).json({ message: "Hotel not found" });
});

export default router;
