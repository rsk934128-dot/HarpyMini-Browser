import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImage = path.resolve('src/assets/images/pwabuilder_logo_1792155190114.jpg');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from:', sourceImage);

  // 1. 512x512 standard icon
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 2. 192x192 standard icon
  await sharp(sourceImage)
    .resize(192, 192, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. 512x512 maskable icon with safe zone (15% padding on dark background #0b0f19)
  const innerSize512 = Math.round(512 * 0.78); // 80% safe zone
  const innerBuffer512 = await sharp(sourceImage)
    .resize(innerSize512, innerSize512, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 } // deep obsidian dark navy matching brand
    }
  })
    .composite([{ input: innerBuffer512, gravity: 'center' }])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. 192x192 maskable icon
  const innerSize192 = Math.round(192 * 0.78);
  const innerBuffer192 = await sharp(sourceImage)
    .resize(innerSize192, innerSize192, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 }
    }
  })
    .composite([{ input: innerBuffer192, gravity: 'center' }])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));
  console.log('Created pwa-maskable-192x192.png');

  // 5. 180x180 apple-touch-icon
  await sharp(sourceImage)
    .resize(180, 180, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 6. Favicons
  await sharp(sourceImage)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  
  await sharp(sourceImage)
    .resize(16, 16, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  await sharp(sourceImage)
    .resize(48, 48, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicons');

  // 7. Screenshots for PWABuilder rich install preview
  const desktopHome = path.resolve('src/assets/images/harpymini_home_1792154644772.jpg');
  if (fs.existsSync(desktopHome)) {
    await sharp(desktopHome)
      .resize(1280, 800, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'screenshot-desktop.png'));
    console.log('Created screenshot-desktop.png');
  }

  const aiChatImg = path.resolve('src/assets/images/harpymini_ai_chat_1792154663170.jpg');
  if (fs.existsSync(aiChatImg)) {
    await sharp(aiChatImg)
      .resize(640, 1136, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(publicDir, 'screenshot-mobile.png'));
    console.log('Created screenshot-mobile.png');
  }

  console.log('All PWA assets successfully generated!');
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
