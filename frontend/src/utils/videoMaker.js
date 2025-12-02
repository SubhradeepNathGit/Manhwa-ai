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
// Smart Animation Filter (OPTIMIZED - No dimension detection)
// =====================================================================
function getAnimationFilter(
  animationType,
  duration,
  imageWidth = 1080,
  imageHeight = 1920,
  canvasWidth = 1080,
  canvasHeight = 1920
) {
  const fps = 24; // Reduced from 30 for faster processing
  const totalFrames = Math.floor(duration * fps);

  // Content area = 60% of canvas width
  const contentWidth = Math.floor(canvasWidth * 0.6);   // 648px
  const leftPadding = Math.floor(canvasWidth * 0.2);    // 216px (black bar)

  // Calculate aspect ratios
  const imageAspect = imageHeight / imageWidth;
  const contentAspect = canvasHeight / contentWidth;

  // =====================================================================
  // DECISION LOGIC
  // =====================================================================

  // TALL IMAGES - Pan down (scroll top to bottom)
  if (imageAspect > contentAspect * 1.3) {
    const scaledWidth = contentWidth;
    const scaledHeight = Math.floor((imageHeight / imageWidth) * contentWidth);
    const panDistance = scaledHeight - canvasHeight;

    if (panDistance > 0) {
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${scaledHeight}:${leftPadding}:0:black,` +
        `crop=${canvasWidth}:${canvasHeight}:0:'(ih-oh)*t/${duration}':exact=1`;
    } else {
      return `scale=${scaledWidth}:${scaledHeight},` +
        `pad=${canvasWidth}:${canvasHeight}:${leftPadding}:(oh-ih)/2:black`;
    }
  }

  // SHORT IMAGES - Zoom effect
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

  // NORMAL IMAGES - Static with subtle zoom
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
// Quick dimension detection (browser-based, much faster)
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
// MAIN FUNCTION (OPTIMIZED)
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
    log('[Video] Starting optimized video generation...');

    const ffmpeg = await loadFFmpeg(onProgress);

    log('[Download] Downloading all assets in parallel...');

    // Download everything in parallel for maximum speed
    const downloadPromises = [
      ...imageUrls.map((url, idx) => 
        downloadImage(url, `image_${idx}.jpg`).then(buffer => ({ buffer, idx }))
      ),
      fetch(audioUrl).then(r => r.arrayBuffer()).then(buffer => ({ buffer, isAudio: true }))
    ];

    const downloads = await Promise.all(downloadPromises);
    
    const imageData = downloads.filter(d => !d.isAudio).sort((a, b) => a.idx - b.idx);
    const audioBuffer = downloads.find(d => d.isAudio).buffer;

    log(`[Download] Downloaded ${imageData.length} images and audio`);

    // Write files to FFmpeg FS
    log('[FFmpeg] Writing files to memory...');
    for (let i = 0; i < imageData.length; i++) {
      await ffmpeg.writeFile(`image_${i}.jpg`, new Uint8Array(imageData[i].buffer));
    }
    await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioBuffer));

    log('[FFmpeg] Files loaded into FFmpeg');

    // =====================================================================
    // Generate clips with optimized settings
    // =====================================================================
    log('[Encode] Generating clips with optimized encoding...');

    const videoClips = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageIndex = scene.image_page_index || i;
      const duration = scene.duration || 3.0;

      const inputFile = `image_${Math.min(imageIndex, imageUrls.length - 1)}.jpg`;
      const outputFile = `clip_${i}.mp4`;

      log(`[Encode] Clip ${i + 1}/${scenes.length}: Processing...`);

      // Quick dimension detection (browser-based, much faster than FFmpeg probe)
      let imageWidth = 1080;
      let imageHeight = 1920;

      try {
        const tempData = await ffmpeg.readFile(inputFile);
        const tempBlob = new Blob([tempData.buffer], { type: 'image/jpeg' });
        const dims = await getImageDimensions(tempBlob);
        imageWidth = dims.width;
        imageHeight = dims.height;
        log(`[Encode] Detected: ${imageWidth}x${imageHeight}`);
      } catch (err) {
        log(`[Encode] Using defaults: ${imageWidth}x${imageHeight}`);
      }

      // Get smart filter
      const filter = getAnimationFilter(
        scene.animation_type,
        duration,
        imageWidth,
        imageHeight,
        1080,
        1920
      );

      // Generate clip with OPTIMIZED settings
      await ffmpeg.exec([
        '-loop', '1',
        '-i', inputFile,
        '-vf', filter,
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-preset', 'ultrafast',      // Fastest preset
        '-crf', '28',                 // Higher CRF = faster (was 23, now 28)
        '-pix_fmt', 'yuv420p',
        '-r', '24',                   // 24 FPS instead of 30
        '-movflags', '+faststart',    // Better streaming
        outputFile,
      ]);

      videoClips.push(outputFile);
      
      // Update progress more frequently
      if (onProgress) {
        const clipProgress = ((i + 1) / scenes.length) * 70; // 70% of total progress
        onProgress(10 + clipProgress);
      }
    }

    log('[Encode] All clips generated');

    // =====================================================================
    // Concatenate clips
    // =====================================================================
    log('[Merge] Merging clips...');

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
    log('[Merge] Clips merged');

    // =====================================================================
    // Add audio
    // =====================================================================
    log('[Audio] Adding audio...');

    await ffmpeg.exec([
      '-i', 'video_no_audio.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '128k',           // Lower audio bitrate for faster processing
      '-shortest',
      'final_video.mp4',
    ]);

    if (onProgress) onProgress(95);
    log('[Audio] Audio merged');

    // Read final video
    const data = await ffmpeg.readFile('final_video.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(blob);

    if (onProgress) onProgress(100);
    log('[Video] Video generation complete!');

    // Cleanup (async, don't wait)
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
        log('[Cleanup] Cleanup completed');
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
    console.error('[Video] Generation failed:', error);
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