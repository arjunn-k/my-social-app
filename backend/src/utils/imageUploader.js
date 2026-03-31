const fs = require("fs/promises");
const path = require("path");
const configureCloudinary = require("../config/cloudinary");

const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

const getBaseUrl = (req) =>
  process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

const uploadImage = async ({ file, folder, req }) => {
  if (!file) {
    return null;
  }

  const cloudinary = configureCloudinary();

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      storageType: "cloudinary",
    };
  }

  await ensureUploadsDir();

  return {
    url: `${getBaseUrl(req)}/uploads/${path.basename(file.path)}`,
    publicId: path.basename(file.path),
    storageType: "local",
  };
};

const deleteImage = async (image) => {
  if (!image || !image.publicId) {
    return;
  }

  if (image.storageType === "cloudinary" && process.env.CLOUDINARY_CLOUD_NAME) {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(image.publicId);
    return;
  }

  if (image.storageType === "local") {
    const filepath = path.join(uploadsDir, image.publicId);
    await fs.rm(filepath, { force: true });
  }
};

module.exports = { uploadImage, deleteImage };

