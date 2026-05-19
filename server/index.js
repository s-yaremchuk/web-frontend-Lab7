import cors from "cors";
import express from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const uploadsDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "inventory.json");

await fs.mkdir(uploadsDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/photos", express.static(uploadsDir));

const readDb = async () => {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
};

const writeDb = async (list) => {
  await fs.writeFile(dbPath, JSON.stringify(list, null, 2), "utf8");
};

const getPhotoRef = (item) => item?.photo || item?.photoPath || "";
const toPublicItem = (item) => {
  const photoRef = getPhotoRef(item);
  const fileName = photoRef ? path.basename(photoRef) : "";
  return {
    id: item.id,
    inventory_name: item.inventory_name,
    description: item.description || "",
    photo_url: fileName ? `/api/photos/${fileName}` : ""
  };
};

const getPhotoPath = (photoRef) => {
  if (!photoRef) return null;
  if (path.isAbsolute(photoRef)) return photoRef;
  return path.join(uploadsDir, photoRef);
};

const findById = (list, id) => list.find((item) => String(item.id) === String(id));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "inventory-api" });
});

app.get("/inventory", async (_req, res, next) => {
  try {
    const list = await readDb();
    res.json(list.map(toPublicItem));
  } catch (error) {
    next(error);
  }
});

app.post(
  "/register",
  upload.single("photo"),
  async (req, res, next) => {
    try {
      const { inventory_name = "", description = "" } = req.body;
      if (!inventory_name || !inventory_name.toString().trim()) {
        return res.status(400).json({ message: "Field 'inventory_name' is required." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Field 'photo' is required." });
      }

      const list = await readDb();
      const item = {
        id: Date.now().toString(),
        inventory_name: inventory_name.toString().trim(),
        description: (description || "").toString().trim(),
        photo: req.file.filename
      };
      list.unshift(item);
      await writeDb(list);
      res.status(201).json(toPublicItem(item));
    } catch (error) {
      next(error);
    }
  }
);

app.get("/inventory/:id", async (req, res, next) => {
  try {
    const list = await readDb();
    const item = findById(list, req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found." });
    res.json(toPublicItem(item));
  } catch (error) {
    next(error);
  }
});

app.put("/inventory/:id", async (req, res, next) => {
  try {
    const { inventory_name = "", description = "" } = req.body ?? {};
    if (!inventory_name.trim()) {
      return res.status(400).json({ message: "Field 'inventory_name' is required." });
    }

    const list = await readDb();
    const item = findById(list, req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found." });

    item.inventory_name = inventory_name.trim();
    item.description = String(description).trim();
    await writeDb(list);
    res.json(toPublicItem(item));
  } catch (error) {
    next(error);
  }
});

app.put(
  "/inventory/:id/photo",
  upload.single("photo"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Field 'photo' is required." });
      }

      const list = await readDb();
      const item = findById(list, req.params.id);
      if (!item) return res.status(404).json({ message: "Inventory item not found." });

      const previousPhoto = item.photo;
      item.photo = req.file.filename;
      await writeDb(list);
      if (previousPhoto) {
        const oldPath = getPhotoPath(previousPhoto);
        await fs.unlink(oldPath).catch(() => undefined);
      }
      res.json(toPublicItem(item));
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/photos/:filename", async (req, res, next) => {
  try {
    const photoPath = getPhotoPath(req.params.filename);
    if (!photoPath) return res.status(404).json({ message: "Photo not found." });
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.sendFile(photoPath);
  } catch (error) {
    next(error);
  }
});

app.get("/inventory/:id/photo", async (req, res, next) => {
  try {
    const list = await readDb();
    const item = findById(list, req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found." });
    const photoRef = getPhotoRef(item);
    if (!photoRef) return res.status(404).json({ message: "Photo not found." });

    const photoPath = getPhotoPath(photoRef);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.sendFile(photoPath);
  } catch (error) {
    next(error);
  }
});

app.delete("/inventory/:id", async (req, res, next) => {
  try {
    const list = await readDb();
    const index = list.findIndex((item) => String(item.id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Inventory item not found." });

    const [removed] = list.splice(index, 1);
    await writeDb(list);
    const removedPhotoRef = getPhotoRef(removed);
    if (removedPhotoRef) {
      const photoPath = getPhotoPath(removedPhotoRef);
      await fs.unlink(photoPath).catch(() => undefined);
    }
    res.json({ message: "Inventory item deleted." });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);
  const message = error?.message || "Internal server error.";
  const status = error?.status || 500;
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Inventory API listening on http://127.0.0.1:${PORT}`);
});
