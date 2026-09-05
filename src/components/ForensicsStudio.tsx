import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Flame,
  ScanEye,
  Crosshair,
  Sliders,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Eye,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { MediaItem, ForensicToolMode, PixelSample, AnomalyPin } from '../types';
import { computeELA, computeNoiseHeatmap, detectArtifactBoxes, ArtifactBox } from '../lib/forensics/imageForensics';

interface ForensicsStudioProps {
  media: MediaItem;
  anomalyPins: AnomalyPin[];
  isAnalyzing: boolean;
}

export const ForensicsStudio: React.FC<ForensicsStudioProps> = ({
  media,
  anomalyPins,
  isAnalyzing,
}) => {
  const [toolMode, setToolMode] = useState<ForensicToolMode>('original');
  const [elaAmplify, setElaAmplify] = useState<number>(20);
  const [elaQuality, setElaQuality] = useState<number>(0.85);
  const [heatmapSensitivity, setHeatmapSensitivity] = useState<number>(1.4);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [pixelSample, setPixelSample] = useState<PixelSample | null>(null);

  // Computed forensic layers
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [artifactBoxes, setArtifactBoxes] = useState<ArtifactBox[]>([]);
  const [isGeneratingLayer, setIsGeneratingLayer] = useState<boolean>(false);

  // Video / Audio Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Pre-generate ELA & Heatmap when media loads
  useEffect(() => {
    if (media.type !== 'image') return;

    let isMounted = true;
    const loadLayers = async () => {
      setIsGeneratingLayer(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = media.url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      try {
        const elaRes = await computeELA(img, elaAmplify, elaQuality);
        const hmRes = await computeNoiseHeatmap(img, heatmapSensitivity);
        const isSynthetic = media.name.toLowerCase().includes('midjourney') || media.name.toLowerCase().includes('synthetic') || media.name.toLowerCase().includes('ai_') || hmRes.standardDeviation < 4.0;
        const isManipulated = media.name.toLowerCase().includes('manipulated') || media.name.toLowerCase().includes('clearance') || elaRes.meanVariance > 20;
        const anomalyType = isSynthetic ? 'ai' : isManipulated ? 'manipulated' : 'clean';
        const boxes = detectArtifactBoxes(anomalyType, elaRes.meanVariance);

        if (isMounted) {
          setElaUrl(elaRes.elaDataUrl);
          setHeatmapUrl(hmRes.heatmapDataUrl);
          setArtifactBoxes(boxes);
        }
      } catch (err) {
        console.error('Layer generation failed:', err);
      } finally {
        if (isMounted) setIsGeneratingLayer(false);
      }
    };

    loadLayers();
    return () => {
      isMounted = false;
    };
  }, [media.url, media.type, elaAmplify, elaQuality, heatmapSensitivity]);

  // Handle pixel inspector hover sampling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (toolMode !== 'inspector' || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setPixelSample(null);
      return;
    }

    const scaleX = (imgRef.current.naturalWidth || rect.width) / rect.width;
    const scaleY = (imgRef.current.naturalHeight || rect.height) / rect.height;
    const nativeX = Math.floor(x * scaleX);
    const nativeY = Math.floor(y * scaleY);

    // Read pixel using offscreen 1x1 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx && imgRef.current) {
      ctx.drawImage(imgRef.current, -nativeX, -nativeY);
      const p = ctx.getImageData(0, 0, 1, 1).data;
      const r = p[0];
      const g = p[1];
      const b = p[2];
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      const lum = Number((0.299 * r + 0.587 * g + 0.114 * b).toFixed(1));

      // HSV calculation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      let h = 0;
      if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      const s = max === 0 ? 0 : d / max;
      const v = max / 255;
      const hsvStr = `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%`;

      setPixelSample({
        x: nativeX,
        y: nativeY,
        r,
        g,
        b,
        hex,
        luminance: lum,
        hsv: hsvStr,
      });
    }
  };

  // Download active forensic mask
  const handleDownloadLayer = () => {
    let targetUrl = media.url;
    let fileName = `${media.name}_original.png`;

    if (toolMode === 'ela' && elaUrl) {
      targetUrl = elaUrl;
      fileName = `${media.name}_ELA_Forensic_Mask.png`;
    } else if (toolMode === 'heatmap' && heatmapUrl) {
      targetUrl = heatmapUrl;
      fileName = `${media.name}_Noise_Heatmap.png`;
    }

    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Seek video or audio when clicking anomaly pin
  const handlePinClick = (pin: AnomalyPin) => {
    if (videoRef.current) {
      videoRef.current.currentTime = pin.time;
      videoRef.current.play();
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.currentTime = pin.time;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Studio Header Toolbar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Inspection Tools Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            id="tool-original"
            onClick={() => {
              setToolMode('original');
              setIsSplitMode(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all ${
              toolMode === 'original' && !isSplitMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>

          {media.type === 'image' && (
            <>
              <button
                id="tool-ela"
                onClick={() => setToolMode('ela')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all ${
                  toolMode === 'ela'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Error Level Analysis (JPEG Compression Discrepancies)"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>ELA Mask</span>
              </button>

              <button
                id="tool-heatmap"
                onClick={() => {
                  setToolMode('heatmap');
                  setIsSplitMode(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all ${
                  toolMode === 'heatmap'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Noise Variance Heatmap (Sensor Grain vs Inpainting)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Noise Heatmap</span>
              </button>

              <button
                id="tool-artifacts"
                onClick={() => {
                  setToolMode('artifacts');
                  setIsSplitMode(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all ${
                  toolMode === 'artifacts'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="AI Generative Artifact Overlay"
              >
                <ScanEye className="w-3.5 h-3.5 text-purple-400" />
                <span>Artifacts</span>
              </button>

              <button
                id="tool-inspector"
                onClick={() => {
                  setToolMode('inspector');
                  setIsSplitMode(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all ${
                  toolMode === 'inspector'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Pixel Loupe & Luminance Telemetry"
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pixel Loupe</span>
              </button>
            </>
          )}
        </div>

        {/* Viewport Utilities & Export */}
        <div className="flex items-center space-x-2">
          {/* Split Compare Mode Toggle */}
          {media.type === 'image' && toolMode === 'ela' && (
            <button
              id="btn-split-mode"
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`p-1.5 text-xs rounded-lg border flex items-center space-x-1 transition-all ${
                isSplitMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Split Before/After Slider"
            >
              <Split className="w-4 h-4" />
              <span className="hidden sm:inline">Split Compare</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-slate-400">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-2xs font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
              className="p-1 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Export Layer Button */}
          <button
            id="btn-download-layer"
            onClick={handleDownloadLayer}
            className="p-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
            title="Download active forensic overlay"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Mask</span>
          </button>
        </div>
      </div>

      {/* Sub-controls (Amplifier & Sensitivity sliders when in ELA/Heatmap mode) */}
      {media.type === 'image' && (toolMode === 'ela' || toolMode === 'heatmap') && (
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          {toolMode === 'ela' ? (
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 font-mono text-2xs uppercase">ELA Calibration:</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xs text-slate-400">Amplification:</span>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={elaAmplify}
                  onChange={(e) => setElaAmplify(Number(e.target.value))}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-2xs text-cyan-300">{elaAmplify}x</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xs text-slate-400">Target Quality:</span>
                <input
                  type="range"
                  min="0.70"
                  max="0.95"
                  step="0.05"
                  value={elaQuality}
                  onChange={(e) => setElaQuality(Number(e.target.value))}
                  className="w-20 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-2xs text-cyan-300">{Math.round(elaQuality * 100)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 font-mono text-2xs uppercase">Noise Heatmap Calibration:</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xs text-slate-400">Sensor Sensitivity:</span>
                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.2"
                  value={heatmapSensitivity}
                  onChange={(e) => setHeatmapSensitivity(Number(e.target.value))}
                  className="w-28 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-2xs text-amber-300">{heatmapSensitivity.toFixed(1)}x</span>
              </div>
            </div>
          )}

          <div className="text-2xs font-mono text-slate-500">
            {toolMode === 'ela'
              ? 'Lighter regions indicate elevated re-compression variance'
              : 'Uniform cool tones = real sensor grain; abrupt red/blue shifts = inpainting'}
          </div>
        </div>
      )}

      {/* Main Viewport Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 min-h-[440px] max-h-[620px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none"
      >
        {isGeneratingLayer && (
          <div className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-2xs font-mono text-cyan-300 flex items-center space-x-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Computing Forensic Matrix...</span>
          </div>
        )}

        {/* IMAGE DISPLAY */}
        {media.type === 'image' && (
          <div
            className="relative max-w-full max-h-full transition-transform duration-100 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base Image */}
            <img
              ref={imgRef}
              src={
                toolMode === 'original'
                  ? media.url
                  : toolMode === 'ela' && !isSplitMode && elaUrl
                  ? elaUrl
                  : toolMode === 'heatmap' && heatmapUrl
                  ? heatmapUrl
                  : media.url
              }
              alt={media.name}
              className="max-h-[540px] w-auto object-contain rounded-lg shadow-2xl pointer-events-none"
            />

            {/* Split view comparison overlay */}
            {toolMode === 'ela' && isSplitMode && elaUrl && (
              <div
                className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                style={{ clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)` }}
              >
                <img
                  src={elaUrl}
                  alt="ELA Layer"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Interactive Split Divider Handle */}
            {toolMode === 'ela' && isSplitMode && (
              <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-cyan-400 shadow-glow-cyber cursor-ew-resize flex items-center justify-center"
                style={{ left: `${splitPosition}%` }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    if (!containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const newPos = Math.max(5, Math.min(95, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                    setSplitPosition(newPos);
                  };
                  const onMouseUp = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                  };
                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', onMouseUp);
                }}
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-2xs shadow-lg">
                  ⬌
                </div>
              </div>
            )}

            {/* AI Artifacts Visual Bounding Boxes */}
            {toolMode === 'artifacts' && (
              <div className="absolute inset-0 pointer-events-none">
                {artifactBoxes.map((box, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-dashed border-purple-400 bg-purple-500/15 rounded-md flex flex-col justify-between p-1 animate-pulse"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  >
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-purple-950/90 border border-purple-400 text-purple-200 self-start">
                      {box.label} ({box.confidence}%)
                    </span>
                    <span className="text-[9px] font-mono text-purple-300 self-end">
                      ANOMALY_BOX_{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pixel Loupe Magnifier overlay on hover */}
            {toolMode === 'inspector' && pixelSample && (
              <div className="absolute top-4 left-4 z-30 p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 space-y-1.5 w-60">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-2xs text-slate-400">
                  <span>PIXEL TELEMETRY</span>
                  <span>
                    X:{pixelSample.x} Y:{pixelSample.y}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded border border-slate-600 shadow-inner"
                    style={{ backgroundColor: pixelSample.hex }}
                  />
                  <div>
                    <span className="text-cyan-400 font-bold">{pixelSample.hex}</span>
                    <p className="text-2xs text-slate-400">
                      RGB({pixelSample.r}, {pixelSample.g}, {pixelSample.b})
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-2xs pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500">Luminance:</span>
                    <p className="text-slate-200">{pixelSample.luminance}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">HSV:</span>
                    <p className="text-slate-200">{pixelSample.hsv}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIDEO DISPLAY */}
        {media.type === 'video' && (
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <video
              ref={videoRef}
              src={media.url}
              controls={false}
              className="max-h-[500px] w-auto rounded-lg shadow-2xl"
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
            />
          </div>
        )}

        {/* AUDIO DISPLAY */}
        {media.type === 'audio' && (
          <div className="w-full max-w-xl p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center space-y-6">
            <audio
              ref={audioRef}
              src={media.url}
              onTimeUpdate={() => {
                if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) setDuration(audioRef.current.duration);
              }}
            />

            {/* Synthetic Waveform Graphic */}
            <div className="w-full h-28 bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between space-x-1">
              {Array.from({ length: 48 }).map((_, idx) => {
                const heightPercent = Math.min(
                  95,
                  Math.max(15, Math.sin(idx * 0.4) * 40 + Math.cos(idx * 0.2) * 30 + 35)
                );
                const isGlitch = idx === 18 || idx === 34;
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all ${
                      isGlitch ? 'bg-rose-500 shadow-glow-danger' : 'bg-cyan-500/70'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Timeline Scrubber with Anomaly Pins (for AV and temporal media) */}
      {(media.type === 'video' || media.type === 'audio' || anomalyPins.length > 0) && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) videoRef.current.pause();
                    else videoRef.current.play();
                    setIsPlaying(!isPlaying);
                  } else if (audioRef.current) {
                    if (isPlaying) audioRef.current.pause();
                    else audioRef.current.play();
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className="font-mono text-2xs text-slate-300">
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>
            </div>

            <span className="text-2xs text-slate-400 font-mono">
              Click marker pin to seek to anomaly cut point
            </span>
          </div>

          {/* Timeline Bar with Anomaly Pin points */}
          <div className="relative w-full h-4 bg-slate-900 rounded-md border border-slate-800 cursor-pointer">
            {/* Playhead progress */}
            <div
              className="h-full bg-cyan-500/30 rounded-md"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />

            {/* Clickable Anomaly Pins */}
            {anomalyPins.map((pin, i) => {
              const pinPos = Math.min(96, Math.max(4, (pin.time / (duration || 10)) * 100));
              return (
                <div
                  key={i}
                  id={`anomaly-pin-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(pin);
                  }}
                  className="absolute top-0 bottom-0 w-2.5 -ml-1.5 bg-rose-500 rounded-full hover:scale-150 transition-transform cursor-pointer shadow-lg shadow-rose-500/50 group"
                  style={{ left: `${pinPos}%` }}
                  title={`${pin.label} at ${pin.time}s (${pin.confidence}% confidence)`}
                >
                  <div className="hidden group-hover:block absolute bottom-6 -left-16 w-36 p-1.5 rounded bg-slate-950 border border-rose-500/60 text-rose-200 text-2xs font-mono text-center z-40 pointer-events-none">
                    {pin.label} [{pin.time}s]
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
