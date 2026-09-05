import { MediaItem } from '../types';

/**
 * Generate a synthetic face test canvas data URI
 */
function createSyntheticPortraitUri(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background with dreamy AI bokeh
  const bgGrad = ctx.createLinearGradient(0, 0, 640, 640);
  bgGrad.addColorStop(0, '#1c1917');
  bgGrad.addColorStop(0.5, '#292524');
  bgGrad.addColorStop(1, '#0c0a09');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 640, 640);

  // Soft bokeh circles
  for (let i = 0; i < 16; i++) {
    const x = (i * 137) % 640;
    const y = (i * 93) % 640;
    const rad = 25 + (i % 5) * 15;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${180 + i * 4}, ${150 + i * 6}, ${210}, 0.08)`;
    ctx.fill();
  }

  // Face Silhouette & features with subtle synthetic lighting
  // Neck
  ctx.fillStyle = '#f4cfb2';
  ctx.fillRect(270, 390, 100, 140);

  // Jaw & Face oval
  ctx.beginPath();
  ctx.ellipse(320, 320, 130, 160, 0, 0, Math.PI * 2);
  const faceGrad = ctx.createRadialGradient(300, 290, 20, 320, 320, 150);
  faceGrad.addColorStop(0, '#fde6d2');
  faceGrad.addColorStop(0.8, '#e5b894');
  faceGrad.addColorStop(1, '#c99672');
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Eyes with mismatched corneal reflections (classic diffusion giveaway)
  // Left eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(265, 305, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2514';
  ctx.beginPath();
  ctx.arc(265, 305, 9, 0, Math.PI * 2);
  ctx.fill();
  // Single round highlight left
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(263, 302, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye (noticeably different rectangular window reflection)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(375, 305, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2514';
  ctx.beginPath();
  ctx.arc(375, 305, 9, 0, Math.PI * 2);
  ctx.fill();
  // Double anomalous highlight right
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(371, 300, 5, 5);
  ctx.fillRect(377, 303, 3, 3);

  // Nose bridge and tip
  ctx.strokeStyle = '#c48f6c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(320, 300);
  ctx.lineTo(315, 345);
  ctx.lineTo(326, 348);
  ctx.stroke();

  // Lips with hyper-smooth gradient
  ctx.fillStyle = '#d46a6a';
  ctx.beginPath();
  ctx.ellipse(320, 385, 32, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair with indistinct strands blending into background
  ctx.fillStyle = '#2c1e14';
  ctx.beginPath();
  ctx.arc(320, 240, 140, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(180, 240);
  ctx.bezierCurveTo(170, 340, 190, 420, 220, 460);
  ctx.lineTo(250, 460);
  ctx.bezierCurveTo(210, 390, 200, 310, 200, 240);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(460, 240);
  ctx.bezierCurveTo(470, 340, 450, 420, 420, 460);
  ctx.lineTo(390, 460);
  ctx.bezierCurveTo(430, 390, 440, 310, 440, 240);
  ctx.fill();

  // Subtle watermark-like generative tag
  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('MIDJOURNEY_V6_SYNTH_SAMPLE // SEED:9281749', 24, 616);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generate an authentic camera capture canvas data URI
 */
function createAuthenticPhotoUri(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Outdoor architectural daylight
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
  skyGrad.addColorStop(0, '#5b8fb9');
  skyGrad.addColorStop(1, '#b6d5e1');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 640, 400);

  // Ground / pavement
  ctx.fillStyle = '#4a4d52';
  ctx.fillRect(0, 400, 640, 240);

  // Realistic building with straight perspective lines
  ctx.fillStyle = '#d9d2c9';
  ctx.fillRect(100, 160, 240, 240);

  // Windows with uniform geometric lattice
  ctx.fillStyle = '#1e293b';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillRect(125 + c * 70, 185 + r * 50, 45, 32);
    }
  }

  // Consistent sun shadow casting at 45 degrees
  ctx.fillStyle = 'rgba(20, 24, 30, 0.4)';
  ctx.beginPath();
  ctx.moveTo(340, 400);
  ctx.lineTo(480, 540);
  ctx.lineTo(480, 580);
  ctx.lineTo(340, 400);
  ctx.fill();

  // Street lamp with crisp silhouette
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(420, 400);
  ctx.lineTo(420, 260);
  ctx.lineTo(405, 240);
  ctx.stroke();

  // Camera sensor noise simulation (natural CMOS Poisson noise across all pixels)
  const imgData = ctx.getImageData(0, 0, 640, 640);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('CANON_EOS_R5 // RF 50mm F1.2L // 1/500s f/4.0 ISO 100', 24, 616);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Generate a manipulated document canvas data URI
 */
function createManipulatedDocumentUri(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Cream document paper background
  ctx.fillStyle = '#fbf7ee';
  ctx.fillRect(0, 0, 640, 640);

  // Border borderlines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 560, 560);
  ctx.strokeRect(46, 46, 548, 548);

  // Document Title
  ctx.font = 'bold 20px serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('OFFICIAL CLEARANCE CERTIFICATE', 140, 95);

  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('ISSUED BY DEPARTMENT OF REGULATORY OVERSIGHT', 140, 120);

  // Document fields
  ctx.font = '14px monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('SUBJECT ID:      VRS-84920-X', 80, 180);
  ctx.fillText('STATUS:          VERIFIED / ACTIVE', 80, 220);
  ctx.fillText('INITIAL DATE:    12 OCT 2021', 80, 260);

  // Forged altered line with different compression background & font blur (manipulation clue!)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(78, 290, 360, 35);
  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('AUTHORIZED SUM:  $2,450,000.00 USD', 80, 314);

  // Stamp with cloned overlapping edge
  ctx.save();
  ctx.translate(450, 420);
  ctx.rotate(-0.18);
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(-80, -35, 160, 70);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#b91c1c';
  ctx.textAlign = 'center';
  ctx.fillText('APPROVED', 0, -5);
  ctx.font = '10px monospace';
  ctx.fillText('AUTHENTICATED SEAL', 0, 16);
  ctx.restore();

  // Signature line
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 480);
  ctx.lineTo(260, 480);
  ctx.stroke();

  ctx.font = 'italic 18px cursive';
  ctx.fillStyle = '#0369a1';
  ctx.fillText('J. Alexander Vance', 90, 470);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('AUTHORIZED AGENT SIGNATURE', 80, 500);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const PRESET_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'sample-ai-portrait',
    name: 'Synthetic_AI_Portrait_Midjourney.jpg',
    type: 'image',
    url: createSyntheticPortraitUri(),
    sizeBytes: 182400,
    width: 640,
    height: 640,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-04T18:30:00Z',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    isPreset: true,
  },
  {
    id: 'sample-authentic-photo',
    name: 'Canon_EOS_R5_Authentic_Street.jpg',
    type: 'image',
    url: createAuthenticPhotoUri(),
    sizeBytes: 342000,
    width: 640,
    height: 640,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-03T14:15:00Z',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    isPreset: true,
  },
  {
    id: 'sample-manipulated-doc',
    name: 'Manipulated_Clearance_Record.jpg',
    type: 'image',
    url: createManipulatedDocumentUri(),
    sizeBytes: 215000,
    width: 640,
    height: 640,
    mimeType: 'image/jpeg',
    createdAt: '2026-09-02T11:45:00Z',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    isPreset: true,
  },
];
