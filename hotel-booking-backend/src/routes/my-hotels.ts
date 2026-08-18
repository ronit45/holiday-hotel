import express, { Request, Response } from "express";
import multer from "multer";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../../../shared/types";
import { uploadService } from "../services/upload.service";
import { hotelService } from "../services/hotel.service";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type")
      .notEmpty()
      .isArray({ min: 1 })
      .withMessage("Select at least one hotel type"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    try {
      const imageFiles = (req as any).files as Express.Multer.File[];
      const newHotelData: HotelType = req.body;

      if (typeof newHotelData.type === "string") {
        newHotelData.type = [newHotelData.type];
      }

      newHotelData.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      newHotelData.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      const imageUrls = await uploadService.uploadImages(imageFiles);

      newHotelData.imageUrls = imageUrls;
      newHotelData.lastUpdated = new Date();
      newHotelData.userId = req.userId;

      const hotel = await hotelService.createHotel(newHotelData);
      res.status(201).send(hotel);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Enriched list: booking status counts + live averageRating from Review collection
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const enrichedHotels = await hotelService.getMyHotels(req.userId);
    res.json(enrichedHotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  try {
    const hotel = await hotelService.getMyHotelById(id, req.userId);
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

/**
 * Owner: toggle hotel isActive.
 * PATCH /api/my-hotels/:id/active
 * Body: { isActive: boolean }
 */
router.patch(
  "/:id/active",
  verifyToken,
  async (req: Request, res: Response) => {
    if (typeof req.body?.isActive !== "boolean") {
      return res.status(400).json({ message: "isActive boolean required" });
    }
    try {
      const hotel = await hotelService.toggleHotelActive(req.params.id, req.body.isActive, req.userId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update hotel status" });
    }
  }
);

router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      // First, find the existing hotel
      const existingHotel = await hotelService.getMyHotelById(req.params.hotelId, req.userId);

      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Prepare update data
      const updateData: any = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        type: Array.isArray(req.body.type) ? req.body.type : [req.body.type],
        pricePerNight: Number(req.body.pricePerNight),
        starRating: Number(req.body.starRating),
        adultCount: Number(req.body.adultCount),
        childCount: Number(req.body.childCount),
        facilities: Array.isArray(req.body.facilities)
          ? req.body.facilities
          : [req.body.facilities],
        lastUpdated: new Date(),
      };

      // Handle contact information
      updateData.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
      };

      // Handle policies
      updateData.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      // Handle image uploads if any
      const files = (req as any).files as Express.Multer.File[];
      const existingImageUrls = req.body.imageUrls
        ? Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : [req.body.imageUrls]
        : [];
        
      if (files && files.length > 0) {
        const updatedImageUrls = await uploadService.uploadImages(files);
        updateData.imageUrls = [
          ...updatedImageUrls,
          ...existingImageUrls,
        ];
      } else {
        updateData.imageUrls = existingImageUrls;
      }

      // Update the hotel
      const updatedHotel = await hotelService.updateHotel(req.params.hotelId, req.userId, updateData);

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
