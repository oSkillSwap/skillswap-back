import multer from "multer";
import path from "node:path";
import fs from "node:fs";

// S'assurer que le dossier tmp/ existe
const tmpDir = path.join("tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// Multer utilise tmp/ comme dossier temporaire
const storage = multer.diskStorage({
  destination: "tmp/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `temp-${req.user?.id}-${Date.now()}${ext}`;
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
