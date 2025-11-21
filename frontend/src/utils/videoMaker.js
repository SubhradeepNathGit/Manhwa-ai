// frontend/src/utils/videoMaker.js (CORRECTED - Fixed aspect ratio & smart scrolling)
/**
 * ⚡ BROWSER-BASED VIDEO GENERATION using FFmpeg.wasm
 * 
 * FEATURES:
 * - 60% content area (20% black bars on sides)
 * - Smart animation: Tall images scroll, short images zoom
 * - Proper panel sizing and centering
 * - HD vertical video output (1080x1920)
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// =====================================================================
// FFmpeg Instance (Singleton)
// =====================================================================
let ffmpegInstance = null;
let isFFmpegLoaded = false;

export async function loadFFmpeg(onProgress) {
  if (isFFmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  try {
    console.log('🎬 Loading FFmpeg.wasm...');

    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    console.log('✅ FFmpeg.wasm loaded');

    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;

    return ffmpeg;

  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error);
    throw new Error('Failed to load video processor');
  }
}

// =====================================================================
// Download Helper
// =====================================================================
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error);
    throw error;
  }
}

// =====================================================================
// Smart Animation Filter (CORRECTED)
// =====================================================================
function getAnimationFilter(
  animationType,
  duration,
  imageWidth,
  imageHeight,
  canvasWidth = 1080,
  canvasHeight = 1920
) {
  const fps = 30;
  const totalFrames = Math.floor(duration * fps);

  // ⚡ Content area = 60% of canvas width
  const contentWidth = Math.floor(canvasWidth * 0.6);   // 648px
  const leftPadding = Math.floor(canvasWidth * 0.2);    // 216px (black bar)

  // Calculate aspect ratios
  const imageAspect = imageHeight / imageWidth;
  const contentAspect = canvasHeight / contentWidth;

  console.log(`Image: ${imageWidth}x${imageHeight}, Aspect: ${imageAspect.toFixed(2)}`);
  console.log(`Content: ${contentWidth}x${canvasHeight}, Aspect: ${contentAspect.toFixed(2)}`);

  // =====================================================================
  // DECISION LOGIC
  // =====================================================================

  // TALL IMAGES → Pan down (scroll top to bottom)
  if (imageAspect > contentAspect * 1.3) {
    console.log('→ Using PAN DOWN (scroll) effect');

    // Scale image to fit WIDTH of content area
    const scaledWidth = contentWidth;
    const scaledHeight = Math.floor((imageHeight / imageWidth) * contentWidth);

    // How much to pan (difference between scaled height and canvas height)
    const panDistance = scaledHeight - canvasHeight;

    if (panDistance > 0) {
      // Scroll from top to bottom
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${scaledHeight}:${leftPadding}:0:black,` +
        `crop=${canvasWidth}:${canvasHeight}:0:'(ih-oh)*t/${duration}':exact=1`;
    } else {
      // Image not tall enough to scroll, just center it
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${canvasHeight}:${leftPadding}:(oh-ih)/2:black`;
    }
  }

  // SHORT IMAGES → Zoom effect
  else if (imageAspect < contentAspect * 0.7) {
    console.log('→ Using ZOOM effect');

    // Scale to fit HEIGHT of canvas
    const scaledHeight = canvasHeight;
    const scaledWidth = Math.floor((imageWidth / imageHeight) * canvasHeight);

    // Ensure it fits in content area
    const finalWidth = Math.min(scaledWidth, contentWidth);
    const finalHeight = Math.floor((imageHeight / imageWidth) * finalWidth);

    // Gentle zoom in
    return `scale=${Math.floor(finalWidth * 1.15)}:${Math.floor(finalHeight * 1.15)},` +
      `zoompan=z='min(zoom+0.0008,1.1)':d=${totalFrames}:` +
      `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
      `s=${finalWidth}x${finalHeight}:fps=${fps},` +
      `pad=${canvasWidth}:${canvasHeight}:${leftPadding + (contentWidth - finalWidth) / 2}:(oh-ih)/2:black`;
  }

  // NORMAL IMAGES → Static with subtle zoom
  else {
    console.log('→ Using STATIC with subtle zoom');

    // Scale to fit content area perfectly
    const scaledHeight = canvasHeight;
    const scaledWidth = Math.floor((imageWidth / imageHeight) * canvasHeight);

    const finalWidth = Math.min(scaledWidth, contentWidth);
    const finalHeight = Math.floor((imageHeight / imageWidth) * finalWidth);

    // Very subtle zoom
    return `scale=${finalWidth}:${finalHeight},` +
      `zoompan=z='1.0+0.0003*on':d=${totalFrames}:` +
      `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
      `s=${finalWidth}x${finalHeight}:fps=${fps},` +
      `pad=${canvasWidth}:${canvasHeight}:${leftPadding + (contentWidth - finalWidth) / 2}:(oh-ih)/2:black`;
  }
}

// =====================================================================
// MAIN FUNCTION
// =====================================================================
export async function generateVideoFromScenes({
  imageUrls,
  audioUrl,
  scenes,
  onProgress,
  onLog,
}) {
  const log = (msg) => {
    console.log(msg);
    if (onLog) onLog(msg);
  };

  try {
    log('🎬 Starting video generation...');

    const ffmpeg = await loadFFmpeg(onProgress);

    log('📥 Downloading images and audio...');

    const imageDownloads = imageUrls.map((url, idx) =>
      downloadImage(url, `image_${idx}.jpg`)
    );

    const audioDownload = fetch(audioUrl).then(r => r.arrayBuffer());

    const [imageBuffers, audioBuffer] = await Promise.all([
      Promise.all(imageDownloads),
      audioDownload,
    ]);

    log(`✅ Downloaded ${imageBuffers.length} images and audio`);

    // Write to FFmpeg FS
    for (let i = 0; i < imageBuffers.length; i++) {
      await ffmpeg.writeFile(`image_${i}.jpg`, new Uint8Array(imageBuffers[i]));
    }

    await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioBuffer));

    log('✅ Files loaded into FFmpeg');

    // =====================================================================
    // Generate clips with smart sizing
    // =====================================================================
    log('🎨 Generating clips with 60% content area...');

    const videoClips = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageIndex = scene.image_page_index || i;
      const duration = scene.duration || 3.0;

      const inputFile = `image_${Math.min(imageIndex, imageUrls.length - 1)}.jpg`;
      const outputFile = `clip_${i}.mp4`;

      log(`  - Clip ${i + 1}/${scenes.length}: Detecting dimensions...`);

      // ⚡ Detect image dimensions
      await ffmpeg.exec([
        '-i', inputFile,
        '-vframes', '1',
        '-f', 'image2',
        `temp_${i}.jpg`
      ]);

      const tempData = await ffmpeg.readFile(`temp_${i}.jpg`);
      const tempBlob = new Blob([tempData.buffer]);
      const tempImg = await createImageBitmap(tempBlob);

      const imageWidth = tempImg.width;
      const imageHeight = tempImg.height;

      tempImg.close();
      await ffmpeg.deleteFile(`temp_${i}.jpg`);

      // Get smart filter
      const filter = getAnimationFilter(
        scene.animation_type,
        duration,
        imageWidth,
        imageHeight,
        1080,
        1920
      );

      // Generate clip
      await ffmpeg.exec([
        '-loop', '1',
        '-i', inputFile,
        '-vf', filter,
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        outputFile,
      ]);

      videoClips.push(outputFile);
    }

    log('✅ All clips generated');

    // =====================================================================
    // Concatenate clips
    // =====================================================================
    log('🔗 Merging clips...');

    const concatContent = videoClips.map(clip => `file '${clip}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatContent);

    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'video_no_audio.mp4',
    ]);

    log('✅ Clips merged');

    // =====================================================================
    // Add audio
    // =====================================================================
    log('🎵 Adding audio...');

    await ffmpeg.exec([
      '-i', 'video_no_audio.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      'final_video.mp4',
    ]);

    log('✅ Audio merged');

    // Read final video
    const data = await ffmpeg.readFile('final_video.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(blob);

    log('✅ Video generation complete!');

    // Cleanup
    try {
      for (const clip of videoClips) {
        await ffmpeg.deleteFile(clip);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('video_no_audio.mp4');
      await ffmpeg.deleteFile('final_video.mp4');

      for (let i = 0; i < imageBuffers.length; i++) {
        await ffmpeg.deleteFile(`image_${i}.jpg`);
      }
      await ffmpeg.deleteFile('audio.mp3');
    } catch (err) {
      console.warn('Cleanup warning:', err);
    }

    return {
      videoUrl,
      blob,
      duration: scenes.reduce((sum, s) => sum + (s.duration || 3), 0),
    };

  } catch (error) {
    console.error('❌ Video generation failed:', error);
    throw error;
  }
}

// =====================================================================
// Download Helper
// =====================================================================
export function downloadVideo(blob, filename = 'manhwa_video.mp4') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}