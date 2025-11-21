// frontend/src/utils/videoMaker.js
/**
 * ⚡ BROWSER-BASED VIDEO GENERATION using FFmpeg.wasm
 * 
 * Features:
 * - Zoom/Pan animations
 * - Audio merging
 * - HD video output
 * - All processing happens in browser (FREE!)
 * 
 * No backend video rendering needed!
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// =====================================================================
// FFmpeg Instance (Singleton)
// =====================================================================
let ffmpegInstance = null;
let isFFmpegLoaded = false;

/**
 * Load FFmpeg.wasm (only once)
 */
export async function loadFFmpeg(onProgress) {
  if (isFFmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  try {
    console.log('🎬 Loading FFmpeg.wasm...');
    
    const ffmpeg = new FFmpeg();
    
    // Progress callback
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });
    
    ffmpeg.on('progress', ({ progress, time }) => {
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }
    });

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    console.log('✅ FFmpeg.wasm loaded successfully');
    
    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;
    
    return ffmpeg;
    
  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error);
    throw new Error('Failed to load video processor. Please refresh the page.');
  }
}

// =====================================================================
// Download Image Helper
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
// Generate Animation Filter for FFmpeg
// =====================================================================
function getAnimationFilter(animationType, duration, width = 1080, height = 1920) {
  const fps = 30;
  const totalFrames = Math.floor(duration * fps);
  
  switch (animationType) {
    case 'zoom_in':
      // Gentle zoom in effect
      return `scale=2*${width}:2*${height},zoompan=z='min(zoom+0.0015,1.5)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
    
    case 'zoom_out':
      // Gentle zoom out effect
      return `scale=2*${width}:2*${height},zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
    
    case 'pan_right':
      // Pan from left to right
      return `scale=2*${width}:2*${height},zoompan=z=1.5:d=${totalFrames}:x='iw/2-(iw/zoom/2)+((iw-iw/zoom)/${totalFrames})*on':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
    
    case 'pan_down':
      // Pan from top to bottom (manga scroll)
      return `scale=${width}:(ih*${width}/iw),zoompan=z=1.0:d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='0+((ih-${height})/${totalFrames})*on':s=${width}x${height}:fps=${fps}`;
    
    case 'static':
      // No animation, just center crop
      return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
    
    default:
      // Default: subtle zoom + pan (Ken Burns effect)
      return `scale=1.3*${width}:1.3*${height},zoompan=z='min(zoom+0.001,1.3)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${fps}`;
  }
}

// =====================================================================
// MAIN FUNCTION: Generate Video from Scenes
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
    
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg(onProgress);

    log('📥 Downloading images and audio...');
    
    // Download all images
    const imageDownloads = imageUrls.map((url, idx) => 
      downloadImage(url, `image_${idx}.jpg`)
    );
    
    // Download audio
    const audioDownload = fetch(audioUrl).then(r => r.arrayBuffer());
    
    // Wait for all downloads
    const [imageBuffers, audioBuffer] = await Promise.all([
      Promise.all(imageDownloads),
      audioDownload,
    ]);

    log(`✅ Downloaded ${imageBuffers.length} images and audio`);

    // Write images to FFmpeg virtual file system
    for (let i = 0; i < imageBuffers.length; i++) {
      await ffmpeg.writeFile(`image_${i}.jpg`, new Uint8Array(imageBuffers[i]));
    }
    
    // Write audio
    await ffmpeg.writeFile('audio.mp3', new Uint8Array(audioBuffer));

    log('✅ Files loaded into FFmpeg');

    // =====================================================================
    // Generate individual video clips for each scene
    // =====================================================================
    log('🎨 Generating animated clips...');
    
    const videoClips = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imageIndex = scene.image_page_index || i;
      const duration = scene.duration || 3.0;
      const animationType = scene.animation_type || 'zoom_pan';
      
      // Get animation filter
      const filter = getAnimationFilter(animationType, duration);
      
      const inputFile = `image_${Math.min(imageIndex, imageUrls.length - 1)}.jpg`;
      const outputFile = `clip_${i}.mp4`;
      
      log(`  - Clip ${i + 1}/${scenes.length}: ${animationType} (${duration}s)`);
      
      // Generate clip with animation
      await ffmpeg.exec([
        '-loop', '1',
        '-i', inputFile,
        '-vf', filter,
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '28',
        '-pix_fmt', 'yuv420p',
        outputFile,
      ]);
      
      videoClips.push(outputFile);
    }

    log('✅ All clips generated');

    // =====================================================================
    // Concatenate all clips
    // =====================================================================
    log('🔗 Merging clips...');
    
    // Create concat file
    const concatContent = videoClips.map(clip => `file '${clip}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatContent);
    
    // Concatenate videos
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'video_no_audio.mp4',
    ]);

    log('✅ Clips merged');

    // =====================================================================
    // Add audio to video
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

    // =====================================================================
    // Read final video
    // =====================================================================
    const data = await ffmpeg.readFile('final_video.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(blob);

    log('✅ Video generation complete!');

    // Cleanup FFmpeg file system
    try {
      // Delete temporary files
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
// Helper: Download Video
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

// =====================================================================
// Helper: Upload to Supabase (Optional)
// =====================================================================
export async function uploadVideoToSupabase(blob, filename, supabaseClient) {
  try {
    const { data, error } = await supabaseClient.storage
      .from('Manhwa_ai')
      .upload(`videos/${filename}`, blob, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabaseClient.storage
      .from('Manhwa_ai')
      .getPublicUrl(`videos/${filename}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload to Supabase failed:', error);
    throw error;
  }
}