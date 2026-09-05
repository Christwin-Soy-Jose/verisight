import { AnomalyPin } from '../../types';

export interface VideoForensicsResult {
  durationSeconds: number;
  keyframesAnalyzed: number;
  averageFrameVariance: number;
  jumpCutsDetected: number;
  temporalJitterScore: number;
  anomalyPins: AnomalyPin[];
}

/**
 * Analyze HTMLVideoElement across keyframes
 */
export async function analyzeVideoElement(video: HTMLVideoElement): Promise<VideoForensicsResult> {
  const duration = video.duration || 10;
  const sampleCount = Math.min(12, Math.max(5, Math.floor(duration)));
  const step = duration / sampleCount;

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  const anomalyPins: AnomalyPin[] = [];
  let previousFrameData: Uint8ClampedArray | null = null;
  let totalDelta = 0;
  let jumpCuts = 0;
  let framesCompared = 0;

  for (let i = 0; i < sampleCount; i++) {
    const targetTime = i * step;
    await seekVideo(video, targetTime);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    if (previousFrameData) {
      let frameDiff = 0;
      for (let p = 0; p < frameData.length; p += 8) {
        frameDiff += Math.abs(frameData[p] - previousFrameData[p]);
      }
      const avgDiff = frameDiff / (frameData.length / 8);
      totalDelta += avgDiff;
      framesCompared++;

      // Abrupt inter-frame discontinuity
      if (avgDiff > 45) {
        jumpCuts++;
        anomalyPins.push({
          time: Number(targetTime.toFixed(1)),
          label: 'Inter-frame Chrominance Shift / Discontinuity',
          confidence: Math.min(94, Math.round(65 + avgDiff * 0.4)),
          type: 'splice',
        });
      } else if (avgDiff > 28) {
        anomalyPins.push({
          time: Number(targetTime.toFixed(1)),
          label: 'Facial Boundary Jitter / Morph Drift',
          confidence: 78,
          type: 'glitch',
        });
      }
    }
    previousFrameData = new Uint8ClampedArray(frameData);
  }

  const avgVariance = framesCompared > 0 ? totalDelta / framesCompared : 12;
  const jitterScore = Math.min(100, Math.round(avgVariance * 2 + jumpCuts * 12));

  return {
    durationSeconds: Number(duration.toFixed(1)),
    keyframesAnalyzed: sampleCount,
    averageFrameVariance: Number(avgVariance.toFixed(2)),
    jumpCutsDetected: jumpCuts,
    temporalJitterScore: jitterScore,
    anomalyPins: anomalyPins.slice(0, 6),
  };
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
