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
  console.log('\n📦 HUA Motion Bundle Analysis\n');
  console.log('='.repeat(60));

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "pnpm build" first.');
    process.exit(1);
  }

  const files = fs.readdirSync(distPath, { recursive: true });
  const jsFiles = files.filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
  const dtsFiles = files.filter(
    (file) => file.endsWith('.d.ts') || file.endsWith('.d.mts') || file.endsWith('.d.cts')
  );

  let totalSize = 0;
  let totalGzip = 0;

  console.log('\n📄 JavaScript Files:\n');
  jsFiles.forEach((file) => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const gzipped = gzipSync(content);
    totalSize += stats.size;
    totalGzip += gzipped.length;
    console.log(
      `  ${file.padEnd(35)} ${formatBytes(stats.size).padStart(10)} (gzip: ${formatBytes(
        gzipped.length
      )})`
    );
  });

  console.log('\n📄 Type Definition Files:\n');
  let totalDts = 0;
  dtsFiles.forEach((file) => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    totalDts += stats.size;
    console.log(`  ${file.padEnd(35)} ${formatBytes(stats.size).padStart(10)}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log(`  Total JS Size:        ${formatBytes(totalSize).padStart(10)}`);
  console.log(`  Total JS (gzipped):   ${formatBytes(totalGzip).padStart(10)}`);
  console.log(`  Total DTS Size:       ${formatBytes(totalDts).padStart(10)}`);
  console.log(`  Total Bundle Size:    ${formatBytes(totalSize + totalDts).padStart(10)}`);
  console.log(`  Total (gzipped):      ${formatBytes(totalGzip + totalDts).padStart(10)}`);

  const target = 30 * 1024; // 30KB target per entry
  if (totalGzip <= target) {
    console.log(`\n✅ Bundle size within target (${formatBytes(target)})`);
  } else {
    console.log(`\n⚠️  Bundle size exceeds target (${formatBytes(target)})`);
    console.log('   Consider further entry-level code splitting or dead-code trimming');
  }

  console.log('\n');
}

analyzeBundle();

