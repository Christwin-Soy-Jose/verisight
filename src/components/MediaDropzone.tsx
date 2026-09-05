import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image, Film, Music, Sparkles, CheckCircle2 } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { PRESET_MEDIA_ITEMS } from '../lib/presets';
import { calculateSha256 } from '../lib/forensics/imageForensics';

interface MediaDropzoneProps {
  onMediaSelect: (media: MediaItem, buffer?: ArrayBuffer) => void;
  isAnalyzing: boolean;
}

export const MediaDropzone: React.FC<MediaDropzoneProps> = ({ onMediaSelect, isAnalyzing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    try {
      let type: MediaType = 'image';
      if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const buffer = await file.arrayBuffer();
      const sha256 = await calculateSha256(buffer);
      const url = URL.createObjectURL(file);

      // Also generate base64 for server payload
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const mediaItem: MediaItem = {
          id: `upload-${Date.now()}`,
          name: file.name,
          type,
          url,
          sizeBytes: file.size,
          mimeType: file.type || (type === 'image' ? 'image/jpeg' : type === 'video' ? 'video/mp4' : 'audio/mp3'),
          base64,
          createdAt: new Date().toISOString(),
          sha256,
        };
        onMediaSelect(mediaItem, buffer);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(`Failed to process file: ${err.message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoadingUrl(true);
    setErrorMessage(null);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch media from URL`);
      const blob = await response.blob();
      const fileName = urlInput.split('/').pop()?.split('?')[0] || 'remote_media';
      const file = new File([blob], fileName, { type: blob.type });
      await handleFileProcess(file);
    } catch (err: any) {
      setErrorMessage(
        `Unable to fetch directly due to CORS restrictions. Please save the image and upload directly, or select a preset sample.`
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop area */}
      <div
        id="media-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-medium text-slate-200">
              Drag & drop media to verify, or <span className="text-cyan-400 underline underline-offset-4">browse files</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports Images (JPG, PNG, WebP), Audio (MP3, WAV), & Video (MP4, WebM) • Privacy-first client-side parsing
            </p>
          </div>

          {/* Supported format badges */}
          <div className="flex items-center space-x-3 pt-2 text-2xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <Image className="w-3.5 h-3.5 text-blue-400" />
              <span>EXIF & ELA Image</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vocoder Audio</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Keyframe Video</span>
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs rounded-lg bg-red-950/50 border border-red-500/40 text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Preset Media Quick Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-slate-300">Quick Test Samples:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_MEDIA_ITEMS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => onMediaSelect(preset)}
              disabled={isAnalyzing}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-slate-300 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{preset.name.replace('.jpg', '').replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
