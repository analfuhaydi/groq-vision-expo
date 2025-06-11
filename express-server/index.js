import express from "express";
import multer from "multer";
import dotenv from "dotenv";

// Initialize Express app.
const app = express();
// Load environment variables from .env file
dotenv.config();

// Use multer to parse multipart/form-data (store in memory)
const multerUpload = multer();

// Load environment variables
const PORT = 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Exit if GROQ_API_KEY is missing
if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in environment variables");
  process.exit(1);
}

/**
 - POST /upload
 - Accepts an image file, sends it to Groq Vision API.
 - and returns a generated description
 */
app.post("/upload", multerUpload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    // Validate that a file was uploaded
    if (!file) {
      return res.status(400).json({ error: "Image is required." });
    }

    // Convert image buffer to base64 string
    const base64Image = file.buffer.toString("base64");

    // Get a description of the image using Groq Vision
    const description = await describeImageWithGroq(base64Image);

    // Send the description back to the client
    res.json({ description });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 - describeImageWithGroq(base64Image)
 - Sends the base64 image to Groq Vision API and returns the description
 */
async function describeImageWithGroq(base64Image) {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image in detail" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq API error:", data);
    throw new Error("Groq API request failed");
  }

  // Return the content of the first response choice
  return data.choices?.[0]?.message?.content || "No description generated";
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
