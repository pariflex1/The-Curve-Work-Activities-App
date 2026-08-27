import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputImagePath = "C:/Users/dipak/.gemini/antigravity-ide/brain/0a934619-25a0-4925-9a97-2824c6786129/.user_uploaded/media_1787827771967.jpg";
const publicDir = "e:/Visitor Management System/My Projects/The Curve Work Activities App/public";
const appDir = "e:/Visitor Management System/My Projects/The Curve Work Activities App/src/app";

async function generate() {
  console.log("Processing input logo:", inputImagePath);
  if (!fs.existsSync(inputImagePath)) {
    throw new Error(`Input image not found: ${inputImagePath}`);
  }

  const image = sharp(inputImagePath);
  const metadata = await image.metadata();
  console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

  // 1. the-curve-logo.webp
  await sharp(inputImagePath)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(publicDir, "the-curve-logo.webp"));
  console.log("  [OK] public/the-curve-logo.webp");

  // 2. icon.webp
  await sharp(inputImagePath)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(publicDir, "icon.webp"));
  console.log("  [OK] public/icon.webp");

  // 3. icon-512.png & icon.png
  await sharp(inputImagePath)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("  [OK] public/icon-512.png");

  await sharp(inputImagePath)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "icon.png"));
  console.log("  [OK] public/icon.png");

  await sharp(inputImagePath)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, "icon.png"));
  console.log("  [OK] src/app/icon.png");

  // 4. icon-192.png
  await sharp(inputImagePath)
    .resize(192, 192, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("  [OK] public/icon-192.png");

  // 5. apple-icon.png & apple-touch-icon.png
  await sharp(inputImagePath)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "apple-icon.png"));
  console.log("  [OK] public/apple-icon.png");

  await sharp(inputImagePath)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("  [OK] public/apple-touch-icon.png");

  await sharp(inputImagePath)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));
  console.log("  [OK] src/app/apple-icon.png");

  // 6. favicon.ico
  await sharp(inputImagePath)
    .resize(48, 48, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon.ico"));
  console.log("  [OK] public/favicon.ico");

  await sharp(inputImagePath)
    .resize(48, 48, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, "favicon.ico"));
  console.log("  [OK] src/app/favicon.ico");

  console.log("\nAll icons and app logos generated successfully!");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
