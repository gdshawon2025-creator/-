import * as THREE from 'three';

// Cache generated textures so we don't recreate them repeatedly
const textureCache: Map<string, THREE.Texture> = new Map();

/**
 * Creates the magnificent Kiswah (কাবার গিলাফ) texture
 * Black jacquard silk with 24K gold embroidered Hizam (belt) and calligraphy
 */
export function createKiswahTexture(): THREE.CanvasTexture {
  const cached = textureCache.get('kiswah');
  if (cached) return cached as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep rich black silk weave base
  ctx.fillStyle = '#0a0a0b';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle jacquard weave pattern (self-embossed Quranic verses in dark gray)
  ctx.fillStyle = '#141416';
  for (let y = 0; y < 1024; y += 32) {
    for (let x = 0; x < 1024; x += 64) {
      const offset = (y % 64 === 0) ? 0 : 32;
      ctx.beginPath();
      // Subtle diamond arabesque
      ctx.moveTo(x + offset + 16, y);
      ctx.lineTo(x + offset + 32, y + 16);
      ctx.lineTo(x + offset + 16, y + 32);
      ctx.lineTo(x + offset, y + 16);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Gold Embroidered Belt (Hizam / الحزام) around the upper 1/3 of the Kaaba
  const beltY = 240;
  const beltHeight = 110;

  // Gold background gradient for the belt
  const goldGrad = ctx.createLinearGradient(0, beltY, 0, beltY + beltHeight);
  goldGrad.addColorStop(0, '#785412');
  goldGrad.addColorStop(0.2, '#d4af37');
  goldGrad.addColorStop(0.5, '#ffd700');
  goldGrad.addColorStop(0.8, '#c59b27');
  goldGrad.addColorStop(1, '#66430d');

  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, beltY, 1024, beltHeight);

  // Belt borders with gold beading
  ctx.strokeStyle = '#ffe066';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, beltY + 2, 1024, beltHeight - 4);
  ctx.strokeStyle = '#523707';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, beltY + 8, 1024, beltHeight - 16);

  // Calligraphy Cartouches inside the belt
  ctx.fillStyle = '#1c1503';
  ctx.font = 'bold 28px "Amiri", "Traditional Arabic", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw simulated sacred calligraphy panels across the belt
  const panels = [
    'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    'إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ',
    'يَا حَيُّ يَا قَيُّومُ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ'
  ];

  const panelWidth = 256;
  panels.forEach((text, i) => {
    const px = i * panelWidth + panelWidth / 2;
    // Ornamental cartridge outline
    ctx.strokeStyle = '#5a3d08';
    ctx.lineWidth = 2;
    ctx.strokeRect(i * panelWidth + 10, beltY + 12, panelWidth - 20, beltHeight - 24);

    // Calligraphy shadow & text
    ctx.fillStyle = '#452e04';
    ctx.fillText(text, px + 1, beltY + beltHeight / 2 + 1);
    ctx.fillStyle = '#150f02';
    ctx.fillText(text, px, beltY + beltHeight / 2);
  });

  // Secondary lower gold medallions (Qindil lamps / قناديل)
  const lampY = beltY + beltHeight + 60;
  for (let i = 0; i < 4; i++) {
    const lx = i * 256 + 128;
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(lx, lampY, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff2a8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#150f02';
    ctx.font = 'bold 16px "Amiri", serif';
    ctx.fillText('يَا رَحْمٰنُ', lx, lampY);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('kiswah', texture);
  return texture;
}

/**
 * Creates the Golden Door of Kaaba (বাবে কাবা)
 */
export function createBabKaabaTexture(): THREE.CanvasTexture {
  const cached = textureCache.get('bab_kaaba');
  if (cached) return cached as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 24K Gold background gradient
  const gold = ctx.createLinearGradient(0, 0, 512, 1024);
  gold.addColorStop(0, '#f5d77f');
  gold.addColorStop(0.3, '#d4af37');
  gold.addColorStop(0.5, '#fff0a3');
  gold.addColorStop(0.7, '#c59b27');
  gold.addColorStop(1, '#8c6511');
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, 512, 1024);

  // Outer ornate frame
  ctx.strokeStyle = '#5a3d08';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 1004);

  ctx.strokeStyle = '#fff3b0';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 984);

  // Center vertical division separating left and right door leaves
  ctx.fillStyle = '#5a3d08';
  ctx.fillRect(252, 20, 8, 984);

  // Decorative rectangular panels with Quranic calligraphy
  const panelHeights = [140, 160, 160, 160, 140];
  let curY = 40;

  panelHeights.forEach((h, idx) => {
    // Left door panel
    ctx.fillStyle = '#ab821b';
    ctx.fillRect(34, curY, 210, h);
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, curY + 2, 206, h - 4);

    // Right door panel
    ctx.fillRect(268, curY, 210, h);
    ctx.strokeRect(270, curY + 2, 206, h - 4);

    // Arabic calligraphy simulation in each panel
    ctx.fillStyle = '#422802';
    ctx.font = 'bold 22px "Amiri", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const panelTexts = [
      ['بِسْمِ اللَّهِ', 'الرَّحْمَٰنِ الرَّحِيمِ'],
      ['إِنَّا فَتَحْنَا', 'لَكَ فَتْحًا مُبِينًا'],
      ['قُلْ هُوَ اللَّهُ', 'أَحَدٌ اللَّهُ الصَّمَدُ'],
      ['لَا إِلٰهَ إِلَّا اللهُ', 'مُحَمَّدٌ رَسُولُ اللهِ'],
      ['رَبَّنَا تَقَبَّلْ', 'مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ']
    ];

    const [t1, t2] = panelTexts[idx % panelTexts.length];
    ctx.fillText(t1, 139, curY + h / 2);
    ctx.fillText(t2, 373, curY + h / 2);

    curY += h + 24;
  });

  // Golden door lock & ring knocker
  ctx.fillStyle = '#3a2405';
  ctx.beginPath();
  ctx.arc(256, 560, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffeaa7';
  ctx.lineWidth = 5;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('bab_kaaba', texture);
  return texture;
}

/**
 * Creates the Mataf Courtyard Marble Texture
 * Pristine white heat-reflective Thassos marble with concentric circular guides
 */
export function createMatafMarbleTexture(): THREE.CanvasTexture {
  const cached = textureCache.get('mataf_marble');
  if (cached) return cached as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Brilliant white Greek marble background
  ctx.fillStyle = '#fbfcfd';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle natural marble veining
  ctx.strokeStyle = 'rgba(210, 218, 226, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    let x = Math.random() * 1024;
    let y = Math.random() * 1024;
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 160;
      y += (Math.random() - 0.5) * 160;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Concentric radial rings representing the Tawaf circular marble tiling
  const center = 512;
  ctx.strokeStyle = 'rgba(195, 205, 215, 0.55)';
  ctx.lineWidth = 2;
  for (let r = 80; r < 500; r += 35) {
    ctx.beginPath();
    ctx.arc(center, center, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Subtle radial joint segments
  ctx.strokeStyle = 'rgba(215, 225, 235, 0.35)';
  ctx.lineWidth = 1;
  const segments = 48;
  for (let i = 0; i < segments; i++) {
    const angle = (i * Math.PI * 2) / segments;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(angle) * 80, center + Math.sin(angle) * 80);
    ctx.lineTo(center + Math.cos(angle) * 500, center + Math.sin(angle) * 500);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set('mataf_marble', texture);
  return texture;
}

/**
 * Creates the Ottoman & Saudi colonnade arch texture
 * Cream marble with alternating golden terracotta voussoirs
 */
export function createColonnadeTexture(): THREE.CanvasTexture {
  const cached = textureCache.get('colonnade');
  if (cached) return cached as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Warm cream limestone base
  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, 512, 512);

  // Alternating bichrome stripes (typical of Islamic grand mosque arches)
  ctx.fillStyle = '#c7926b';
  for (let y = 0; y < 512; y += 48) {
    ctx.fillRect(0, y, 512, 24);
  }

  // Arabesque frieze on top
  ctx.fillStyle = '#a67347';
  ctx.fillRect(0, 0, 512, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set('colonnade', texture);
  return texture;
}

/**
 * Creates the iconic Makkah Royal Clock face texture
 */
export function createClockFaceTexture(): THREE.CanvasTexture {
  const cached = textureCache.get('clock_face');
  if (cached) return cached as THREE.CanvasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark green Islamic mosaic dial
  const dialGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 250);
  dialGrad.addColorStop(0, '#063d27');
  dialGrad.addColorStop(0.8, '#032316');
  dialGrad.addColorStop(1, '#01150c');
  ctx.fillStyle = dialGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  // Outer gold rim
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Inner illuminated ring
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 215, 0, Math.PI * 2);
  ctx.stroke();

  // Clock tick marks & hours
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
    const x = 256 + Math.cos(angle) * 185;
    const y = 256 + Math.sin(angle) * 185;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Islamic calligraphy "الله أكبر"
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px "Amiri", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('اللَّهُ أَكْبَرُ', 256, 256);

  // Golden clock hands
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  // Hour hand pointing to 10
  ctx.beginPath();
  ctx.moveTo(256, 256);
  ctx.lineTo(170, 160);
  ctx.stroke();

  // Minute hand pointing to 2
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(256, 256);
  ctx.lineTo(350, 140);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('clock_face', texture);
  return texture;
}
