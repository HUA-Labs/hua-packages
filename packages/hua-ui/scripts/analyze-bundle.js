const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const distPath = path.join(__dirname, '../dist');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundle() {
  console.log('\n📦 Bundle Size Analysis\n');
  console.log('='.repeat(60));

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "pnpm build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distPath, { recursive: true });
  const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
  const dtsFiles = files.filter(file => file.endsWith('.d.ts') || file.endsWith('.d.mts') || file.endsWith('.d.cts'));

  let totalSize = 0;
  let totalGzipped = 0;

  console.log('\n📄 JavaScript Files:\n');
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const gzipped = gzipSync(content);
    
    totalSize += stats.size;
    totalGzipped += gzipped.length;

    console.log(`  ${file.padEnd(40)} ${formatBytes(stats.size).padStart(10)} (gzip: ${formatBytes(gzipped.length)})`);
  });

  console.log('\n📄 Type Definition Files:\n');
  let totalDtsSize = 0;
  dtsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    totalDtsSize += stats.size;
    console.log(`  ${file.padEnd(40)} ${formatBytes(stats.size).padStart(10)}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`  Total JS Size:        ${formatBytes(totalSize).padStart(10)}`);
  console.log(`  Total JS (gzipped):   ${formatBytes(totalGzipped).padStart(10)}`);
  console.log(`  Total DTS Size:      ${formatBytes(totalDtsSize).padStart(10)}`);
  console.log(`  Total Bundle Size:   ${formatBytes(totalSize + totalDtsSize).padStart(10)}`);
  console.log(`  Total (gzipped):     ${formatBytes(totalGzipped + totalDtsSize).padStart(10)}`);
  
  // 목표: 50KB 이하 (gzipped)
  const targetSize = 50 * 1024; // 50KB
  if (totalGzipped <= targetSize) {
    console.log(`\n✅ Bundle size is within target (${formatBytes(targetSize)})`);
  } else {
    console.log(`\n⚠️  Bundle size exceeds target (${formatBytes(targetSize)})`);
    console.log(`   Consider code splitting or tree-shaking optimization`);
  }

  console.log('\n');
}

analyzeBundle();

