import { AnomalyPin } from '../../types';

export interface AudioForensicsResult {
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  spectralFlatness: number;
  zeroCrossingRate: number;
  spliceJumps: number;
  vocoderLikelihood: number;
  anomalyPins: AnomalyPin[];
}

/**
 * Decode and analyze audio buffers using Web Audio API
 */
export async function analyzeAudioBuffer(audioBuffer: AudioBuffer): Promise<AudioForensicsResult> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  const length = channelData.length;

  // 1. Zero Crossing Rate (ZCR)
  let zeroCrossings = 0;
  for (let i = 1; i < length; i++) {
    if ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / length;

  // 2. Short-time RMS energy analysis (detecting abrupt acoustic splices)
  const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
  const hopSize = Math.floor(windowSize / 2);
  const rmsValues: number[] = [];
  const anomalyPins: AnomalyPin[] = [];

  let previousRms = 0;
  let spliceJumps = 0;

  for (let offset = 0; offset + windowSize < length; offset += hopSize) {
    let sumSq = 0;
    for (let i = 0; i < windowSize; i++) {
      const val = channelData[offset + i];
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / windowSize);
    rmsValues.push(rms);

    const currentTime = offset / sampleRate;

    // Detect unnatural volume step / drop without natural vocal decay
    if (previousRms > 0.05 && rms > 0) {
      const ratio = rms / previousRms;
      if (ratio > 4.5 || ratio < 0.15) {
        spliceJumps++;
        anomalyPins.push({
          time: Number(currentTime.toFixed(2)),
          label: ratio > 1 ? 'Acoustic Energy Surge / Insertion' : 'Phase Cancellation Drop',
          confidence: Math.min(96, Math.round(70 + Math.abs(ratio - 1) * 6)),
          type: 'audio_jump',
        });
      }
    }
    previousRms = rms;
  }

  // 3. Spectral Flatness Estimate
  // High flatness indicates synthetic neural vocoder quantization noise
  let sumRms = 0;
  let prodLog = 0;
  const validRms = rmsValues.filter((v) => v > 0.001);
  for (const v of validRms) {
    sumRms += v;
    prodLog += Math.log(v);
  }
  const arithMean = sumRms / (validRms.length || 1);
  const geomMean = Math.exp(prodLog / (validRms.length || 1));
  const spectralFlatness = Math.min(1.0, Math.max(0.01, geomMean / (arithMean || 1)));

  // Vocoder likelihood heuristic based on flat noise floor + high ZCR
  const vocoderLikelihood = Math.min(
    98,
    Math.round(spectralFlatness * 60 + (zcr > 0.12 ? 30 : 10) + spliceJumps * 4)
  );

  return {
    durationSeconds: Number(duration.toFixed(2)),
    sampleRate,
    channels: audioBuffer.numberOfChannels,
    spectralFlatness: Number(spectralFlatness.toFixed(3)),
    zeroCrossingRate: Number(zcr.toFixed(4)),
    spliceJumps,
    vocoderLikelihood,
    anomalyPins: anomalyPins.slice(0, 5), // Cap top 5 anomalies
  };
}
