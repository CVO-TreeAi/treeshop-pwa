// Simple script to create TreeAI icons using canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - TreeAI theme color
  ctx.fillStyle = '#bafa64';
  ctx.fillRect(0, 0, size, size);
  
  // Tree icon (simple)
  ctx.fillStyle = '#121311';
  
  // Tree trunk
  const trunkWidth = size * 0.1;
  const trunkHeight = size * 0.3;
  ctx.fillRect(size/2 - trunkWidth/2, size - trunkHeight, trunkWidth, trunkHeight);
  
  // Tree canopy (circle)
  const radius = size * 0.25;
  ctx.beginPath();
  ctx.arc(size/2, size * 0.4, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // AI text
  ctx.fillStyle = '#121311';
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('AI', size/2, size * 0.85);
  
  return canvas.toBuffer('image/png');
}

// Create icons directory
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true });
}

// Create 192x192 icon
fs.writeFileSync('public/icons/icon-192.png', createIcon(192));
console.log('Created icon-192.png');

// Create 512x512 icon
fs.writeFileSync('public/icons/icon-512.png', createIcon(512));
console.log('Created icon-512.png');

console.log('PWA icons created successfully!');