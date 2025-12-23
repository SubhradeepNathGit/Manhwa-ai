// frontend/src/utils/videoMaker.js (FIXED: Added Smart Sequence Detection)
/**
 * ⚡ BROWSER-BASED VIDEO GENERATION
 * * FEATURES:
 * - Smart Sequence Detector: Fixes "Only 1st panel showing" bug
 * - Robust index parsing (Handles strings "0" vs number 0)
 * - 60% content area with smart animations
 * - Browser-native image probing (Faster than FFmpeg probe)
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
    console.log('[FFmpeg] Already loaded, reusing instance');
    return ffmpegInstance;
  }

  try {
    console.log('[FFmpeg] Loading FFmpeg.wasm...');

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

    console.log('[FFmpeg] Loaded successfully');

    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;

    return ffmpeg;

  } catch (error) {
    console.error('[FFmpeg] Failed to load:', error);
    throw new Error('Failed to load video processor');
  }
}

// =====================================================================
// Download Helper (with retry)
// =====================================================================
async function downloadImage(url, filename, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.arrayBuffer();
    } catch (error) {
      if (i === retries - 1) {
        console.error(`[Download] Failed ${filename} after ${retries} attempts:`, error);
        throw error;
      }
      console.warn(`[Download] Retry ${i + 1}/${retries} for ${filename}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// =====================================================================
// Quick dimension detection (browser-based)
// =====================================================================
async function getImageDimensions(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// =====================================================================
// Smart Animation Filter (60% content area)
// =====================================================================
function getAnimationFilter(
  imageWidth,
  imageHeight,
  duration,
  canvasWidth = 1080,
  canvasHeight = 1920
) {
  const fps = 24;
  const totalFrames = Math.floor(duration * fps);

  // Content area = 60% of canvas width
  const contentWidth = Math.floor(canvasWidth * 0.6);   // 648px
  const leftPadding = Math.floor(canvasWidth * 0.2);    // 216px

  // Calculate aspect ratios
  const imageAspect = imageHeight / imageWidth;
  const contentAspect = canvasHeight / contentWidth;

  // console.log(`[Filter] Image ${imageWidth}x${imageHeight}, Aspect: ${imageAspect.toFixed(2)}`);

  // =====================================================================
  // TALL IMAGES - Pan down (scroll)
  // =====================================================================
  if (imageAspect > contentAspect * 1.3) {
    const scaledWidth = contentWidth;
    const scaledHeight = Math.floor((imageHeight / imageWidth) * contentWidth);
    const panDistance = scaledHeight - canvasHeight;

    if (panDistance > 0) {
      // Scroll from top to bottom
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${scaledHeight}:${leftPadding}:0:black,` +
        `crop=${canvasWidth}:${canvasHeight}:0:'(ih-oh)*t/${duration}':exact=1`;
    } else {
      // Not tall enough to scroll, just center
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${canvasHeight}:${leftPadding}:(oh-ih)/2:black`;
    }
  }

  // =====================================================================
  // SHORT IMAGES - Zoom effect
  // =====================================================================
  else if (imageAspect < contentAspect * 0.7) {
    const scaledHeight = canvasHeight;
    const scaledWidth = Math.floor((imageWidth / imageHeight) * canvasHeight);
    const finalWidth = Math.min(scaledWidth, contentWidth);
    const finalHeight = Math.floor((imageHeight / imageWidth) * finalWidth);

    return `scale=${Math.floor(finalWidth * 1.15)}:${Math.floor(finalHeight * 1.15)},` +
      `zoompan=z='min(zoom+0.0008,1.1)':d=${totalFrames}:` +
      `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
      `s=${finalWidth}x${finalHeight}:fps=${fps},` +
      `pad=${canvasWidth}:${canvasHeight}:${leftPadding + (contentWidth - finalWidth) / 2}:(oh-ih)/2:black`;
  }

  // =====================================================================
  // NORMAL IMAGES - Static with subtle zoom
  // =====================================================================
  else {
    const scaledHeight = canvasHeight;
    const scaledWidth = Math.floor((imageWidth / imageHeight) * canvasHeight);
    const finalWidth = Math.min(scaledWidth, contentWidth);
    const finalHeight = Math.floor((imageHeight / imageWidth) * finalWidth);

    return `scale=${finalWidth}:${finalHeight},` +
      `zoompan=z='1.0+0.0003*on':d=${totalFrames}:` +
      `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':` +
      `s=${finalWidth}x${finalHeight}:fps=${fps},` +
      `pad=${canvasWidth}:${canvasHeight}:${leftPadding + (contentWidth - finalWidth) / 2}:(oh-ih)/2:black`;
  }
}

// =====================================================================
// MAIN FUNCTION (FIXED)
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
    log('[Video] Starting video generation...');

    // ⚡ VALIDATION: Check scene data
    if (!scenes || scenes.length === 0) {
      throw new Error('No scenes provided');
    }

    log(`[Video] Processing ${scenes.length} scenes with ${imageUrls.length} images`);

    // ------------------------------------------------------------------------
    // 🔍 SMART SEQUENCE DETECTOR
    // If backend assigns "0" to every scene but we have multiple images,
    // we force sequential distribution (0->0, 1->1, 2->2)
    // ------------------------------------------------------------------------
    let shouldForceSequential = false;
    if (imageUrls.length > 1) {
      const assignedIndices = scenes.map(s => s.image_page_index);
      const uniqueIndices = new Set(assignedIndices.filter(idx => idx !== undefined && idx !== null));
      
      // Check if all assigned indices are 0 or "0"
      const allZero = uniqueIndices.size === 1 && (uniqueIndices.has(0) || uniqueIndices.has("0"));
      
      // Check if indices are missing entirely
      const allMissing = uniqueIndices.size === 0;

      if (allZero || allMissing) {
        shouldForceSequential = true;
        log('⚠ DETECTED BROKEN SCENE INDICES (All 0 or Missing).');
        log('⚡ Enabling Smart Fix: Forcing sequential display (Scene 1->Img 1, Scene 2->Img 2...)');
      }
    }

    const ffmpeg = await loadFFmpeg(onProgress);

    log('[Download] Downloading all assets...');

    // Download everything in parallel
    const downloadPromises = [
      ...imageUrls.map((url, idx) =>
        downloadImage(url, `image_${idx}.jpg`).then(buffer => ({ buffer, idx }))
      ),
      fetch(audioUrl).then(r => r.arrayBuffer()).then(buffer => ({ buffer, isAudio: true }))
    ];

    const downloads = await Promise.all(downloadPromises);

    const imageData = downloads.filter(d => !d.isAudio).sort((a, b) => a.idx - b.idx);
    const audioBuffer = downloads.find(d => d.isAudio).buffer;

    log(`[Download] ✅ Downloaded ${imageData.length} images and audio`);

    // Write files to FFmpeg
    log('[FFmpeg] Writing files to memory...');
    for (let i = 0; i < imageData.length; i++) {
      await ffmpeg.writeFile(`image_${i}.jpg`, new Uint8Array(imageData[i].buffer));
    }
    await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioBuffer));

    log('[FFmpeg] ✅ Files loaded');

    // =====================================================================
    // ⚡ FIX: Generate clips
    // =====================================================================
    log('[Encode] Generating clips...');

    const videoClips = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      let imageIndex;

      if (shouldForceSequential) {
        // FORCE SEQUENTIAL (Fixes the bug)
        imageIndex = i % imageUrls.length;
      } else {
        // USE BACKEND INDEX (Normal logic)
        let rawIndex = scene.image_page_index;
        
        // Parse strings "0" -> 0
        if (typeof rawIndex === 'string' && !isNaN(parseInt(rawIndex, 10))) {
          rawIndex = parseInt(rawIndex, 10);
        }

        if (typeof rawIndex === 'number' && !isNaN(rawIndex)) {
          imageIndex = rawIndex;
        } else {
          imageIndex = i % imageUrls.length; // Fallback
        }
      }

      // Clamp to valid range
      imageIndex = Math.max(0, Math.min(imageIndex, imageUrls.length - 1));

      const duration = scene.duration || 3.0;
      const inputFile = `image_${imageIndex}.jpg`;
      const outputFile = `clip_${i}.mp4`;

      log(`[Encode] Clip ${i + 1}/${scenes.length} → Using ${inputFile} (Duration: ${duration}s)`);

      // Detect dimensions
      let imageWidth = 1080;
      let imageHeight = 1920;

      try {
        const tempData = await ffmpeg.readFile(inputFile);
        const tempBlob = new Blob([tempData.buffer], { type: 'image/jpeg' });
        const dims = await getImageDimensions(tempBlob);
        imageWidth = dims.width;
        imageHeight = dims.height;
      } catch (err) {
        log(`[Encode] ⚠ Using default dimensions for panel ${imageIndex}`);
      }

      // Get animation filter
      const filter = getAnimationFilter(
        imageWidth,
        imageHeight,
        duration,
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
        '-crf', '28',
        '-pix_fmt', 'yuv420p',
        '-r', '24',
        '-movflags', '+faststart',
        outputFile,
      ]);

      videoClips.push(outputFile);

      // Update progress
      if (onProgress) {
        const clipProgress = ((i + 1) / scenes.length) * 70;
        onProgress(10 + clipProgress);
      }
    }

    log('[Encode] ✅ All clips generated');

    // =====================================================================
    // Concatenate clips
    // =====================================================================
    log('[Merge] Merging clips in sequence...');

    const concatContent = videoClips.map(clip => `file '${clip}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatContent);

    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'video_no_audio.mp4',
    ]);

    if (onProgress) onProgress(85);
    log('[Merge] ✅ Clips merged');

    // =====================================================================
    // Add audio
    // =====================================================================
    log('[Audio] Adding audio track...');

    await ffmpeg.exec([
      '-i', 'video_no_audio.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      'final_video.mp4',
    ]);

    if (onProgress) onProgress(95);
    log('[Audio] ✅ Audio merged');

    // Read final video
    const data = await ffmpeg.readFile('final_video.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(blob);

    if (onProgress) onProgress(100);
    log('[Video] ✅ Video generation complete!');

    // Cleanup (async)
    setTimeout(async () => {
      try {
        for (const clip of videoClips) {
          await ffmpeg.deleteFile(clip);
        }
        await ffmpeg.deleteFile('concat.txt');
        await ffmpeg.deleteFile('video_no_audio.mp4');
        await ffmpeg.deleteFile('final_video.mp4');

        for (let i = 0; i < imageData.length; i++) {
          await ffmpeg.deleteFile(`image_${i}.jpg`);
        }
        await ffmpeg.deleteFile('audio.mp3');
        log('[Cleanup] ✅ Cleanup completed');
      } catch (err) {
        console.warn('[Cleanup] Warning:', err);
      }
    }, 100);

    return {
      videoUrl,
      blob,
      duration: scenes.reduce((sum, s) => sum + (s.duration || 3), 0),
    };

  } catch (error) {
    console.error('[Video] ❌ Generation failed:', error);
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