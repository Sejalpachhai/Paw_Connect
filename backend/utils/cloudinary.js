// backend/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary config (must exist in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const normalizeToBuffer = (input) => {
  if (!input) return null;

  // already Buffer
  if (Buffer.isBuffer(input)) return input;

  // common case: { type: "Buffer", data: [...] }
  if (typeof input === "object" && Array.isArray(input.data)) {
    return Buffer.from(input.data);
  }

  // Uint8Array / TypedArray
  if (input instanceof Uint8Array) return Buffer.from(input);

  // ArrayBuffer
  if (input instanceof ArrayBuffer) return Buffer.from(new Uint8Array(input));

  return null;
};

// ✅ This matches how YOU are calling it:
// uploadBufferToCloudinary({ buffer, mimetype, folder })
export const uploadBufferToCloudinary = ({ buffer, mimetype, folder }) => {
  const realBuffer = normalizeToBuffer(buffer);
  if (!realBuffer) {
    throw new Error(
      "Invalid buffer: Multer memoryStorage required and file.buffer must be a Buffer"
    );
  }

  const resourceType = mimetype?.startsWith("video") ? "video" : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || "echoes-of-nepal",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(realBuffer); // ✅ must be Buffer
  });
};

export default cloudinary;
