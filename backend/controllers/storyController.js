// backend/controllers/storyController.js
import pool from "../config/db.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

export const getAllStories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.location_tag,
        s.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sm.id,
              'media_url', sm.media_url,
              'media_type', sm.media_type
            )
          ) FILTER (WHERE sm.id IS NOT NULL),
          '[]'
        ) AS media
      FROM stories s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.id
      GROUP BY s.id, u.id
      ORDER BY s.created_at DESC
    `);

    res.json({ stories: result.rows });
  } catch (err) {
    console.error("getAllStories error:", err.message);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
};

export const getMyStories = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.location_tag,
        s.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', sm.id,
              'media_url', sm.media_url,
              'media_type', sm.media_type
            )
          ) FILTER (WHERE sm.id IS NOT NULL),
          '[]'
        ) AS media
      FROM stories s
      LEFT JOIN story_media sm ON sm.story_id = s.id
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `,
      [userId]
    );

    res.json({ stories: result.rows });
  } catch (err) {
    console.error("getMyStories error:", err.message);
    res.status(500).json({ error: "Failed to fetch your stories" });
  }
};

export const createStory = async (req, res) => {
  const { title, description, location_tag } = req.body;

  try {
    if (!title) return res.status(400).json({ error: "Title is required" });

    const userId = req.user.id;

    const storyInsert = await pool.query(
      `
      INSERT INTO stories (user_id, title, description, location_tag)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, location_tag, created_at
      `,
      [userId, title, description || "", location_tag || ""]
    );

    const story = storyInsert.rows[0];

    // ✅ Upload files to Cloudinary
    const files = req.files || [];

    for (const f of files) {
      const mediaType = f.mimetype.startsWith("video") ? "video" : "image";

      const uploadResult = await uploadBufferToCloudinary({
        buffer: f.buffer,
        mimetype: f.mimetype,
        folder: process.env.CLOUDINARY_FOLDER || "echoes-of-nepal",
      });

      const mediaUrl = uploadResult.secure_url;

      await pool.query(
        `
        INSERT INTO story_media (story_id, media_url, media_type)
        VALUES ($1, $2, $3)
        `,
        [story.id, mediaUrl, mediaType]
      );
    }

    res.status(201).json({
      story_id: story.id,
      message: "Story created",
    });
  } catch (err) {
    console.error("createStory error:", err.message);
    res.status(500).json({ error: "Failed to create story" });
  }
};
