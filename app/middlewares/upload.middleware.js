import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Format: avatar-userId-timestamp.webp
    const ext = path.extname(file.originalname);
    const uniqueName = `avatar-${req.user?.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers images sont autorisés (jpeg, png, webp, gif)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo max
  },
});
