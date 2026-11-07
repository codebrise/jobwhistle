import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, 'assets');

// Brand Colors
const COLORS = {
  deepPine: '#142522',
  signalLime: '#C8F169',
  signalTeal: '#347D72',
  sage: '#A9C5B1',
  pureWhite: '#FFFFFF',
  pureBlack: '#000000',
  darkSurface: '#0D1515',
  lightBg: '#F4F6F3',
  borderDark: '#2C3936',
  borderLight: '#DCE4DE',
  statusUp: '#19875D',
  statusDown: '#D45252',
  statusDegraded: '#C48A28',
};

// Ensure directories exist
const dirs = [
  'assets/brand/logo/primary',
  'assets/brand/logo/monochrome',
  'assets/brand/logo/light',
  'assets/brand/logo/dark',
  'assets/brand/symbol',
  'assets/brand/wordmark',
  'assets/brand/brand-guide',
  'assets/icons/favicon',
  'assets/icons/web',
  'assets/icons/integrations',
  'assets/app-icons/master',
  'assets/app-icons/android',
  'assets/app-icons/ios',
  'assets/app-icons/pwa',
  'assets/illustrations',
  'assets/social',
  'assets/screenshots',
  'assets/email',
];

for (const d of dirs) {
  fs.mkdirSync(path.join(rootDir, d), { recursive: true });
}

/**
 * Symbol SVG Generator
 * Geometric whistle + acoustic radar monitoring signals
 */
function getSymbolSvg(opts = {}) {
  const {
    whistleFill = COLORS.signalLime,
    signalColor = COLORS.signalLime,
    apertureFill = COLORS.deepPine,
    size = 100,
    background = null,
  } = opts;

  const bgRect = background
    ? `<rect width="100" height="100" rx="20" fill="${background}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  ${bgRect}
  <g id="jobwhistle-symbol">
    <!-- Acoustic / Monitoring Radar Pulses -->
    <path d="M 52 30 A 28 28 0 0 1 76 54" fill="none" stroke="${signalColor}" stroke-width="4.5" stroke-linecap="round" opacity="0.45" />
    <path d="M 57 23 A 38 38 0 0 1 88 54" fill="none" stroke="${signalColor}" stroke-width="4" stroke-linecap="round" opacity="0.75" />
    <path d="M 62 16 A 48 48 0 0 1 97 51" fill="none" stroke="${signalColor}" stroke-width="3.5" stroke-linecap="round" opacity="1" />
    
    <!-- Precision Whistle Resonator Chamber & Body -->
    <!-- Mouthpiece stem -->
    <path d="M 12 50 L 36 50 L 36 68 L 12 68 C 9.5 68 8 66 8 63.5 L 8 54.5 C 8 52 9.5 50 12 50 Z" fill="${whistleFill}" />
    <!-- Resonator Ball Chamber -->
    <circle cx="48" cy="59" r="19" fill="${whistleFill}" />
    <!-- Sound Aperture Slot / Bevel -->
    <path d="M 36 50 L 44 38 L 52 38 L 48 50 Z" fill="${whistleFill}" />
    <polygon points="40,49 46,39 48,49" fill="${apertureFill}" opacity="0.9" />
    <!-- Resonator Core Pin / Lanyard Eyelet -->
    <circle cx="48" cy="59" r="7.5" fill="${apertureFill}" />
    <!-- Pulse Center Signal Dot -->
    <circle cx="48" cy="38" r="2.5" fill="${signalColor}" />
  </g>
</svg>`;
}

/**
 * Wordmark SVG Generator
 */
function getWordmarkSvg(opts = {}) {
  const {
    textColor = COLORS.deepPine,
    taglineColor = COLORS.sage,
    size = 320,
    showEndorsement = true,
  } = opts;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="${size}" height="${(size * 80) / 320}">
  <text x="8" y="44" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="36" font-weight="800" fill="${textColor}" letter-spacing="-0.04em">Job<tspan fill="${textColor}" font-weight="500">whistle</tspan></text>
  ${
    showEndorsement
      ? `<text x="10" y="66" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="9" font-weight="600" fill="${taglineColor}" letter-spacing="0.25em">BY CODEBRISE</text>`
      : ''
  }
</svg>`;
}

/**
 * Horizontal Full Logo SVG Generator
 */
function getHorizontalLogoSvg(opts = {}) {
  const {
    whistleFill = COLORS.signalLime,
    signalColor = COLORS.signalLime,
    apertureFill = COLORS.deepPine,
    textColor = COLORS.deepPine,
    endorsementColor = COLORS.sage,
    background = null,
    width = 440,
    height = 100,
  } = opts;

  const bgRect = background
    ? `<rect width="${width}" height="${height}" rx="16" fill="${background}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgRect}
  <g transform="translate(16, 10)">
    <!-- Symbol scaled to 80x80 -->
    <g transform="scale(0.8)">
      <path d="M 52 30 A 28 28 0 0 1 76 54" fill="none" stroke="${signalColor}" stroke-width="4.5" stroke-linecap="round" opacity="0.45" />
      <path d="M 57 23 A 38 38 0 0 1 88 54" fill="none" stroke="${signalColor}" stroke-width="4" stroke-linecap="round" opacity="0.75" />
      <path d="M 62 16 A 48 48 0 0 1 97 51" fill="none" stroke="${signalColor}" stroke-width="3.5" stroke-linecap="round" opacity="1" />
      <path d="M 12 50 L 36 50 L 36 68 L 12 68 C 9.5 68 8 66 8 63.5 L 8 54.5 C 8 52 9.5 50 12 50 Z" fill="${whistleFill}" />
      <circle cx="48" cy="59" r="19" fill="${whistleFill}" />
      <path d="M 36 50 L 44 38 L 52 38 L 48 50 Z" fill="${whistleFill}" />
      <polygon points="40,49 46,39 48,49" fill="${apertureFill}" opacity="0.9" />
      <circle cx="48" cy="59" r="7.5" fill="${apertureFill}" />
      <circle cx="48" cy="38" r="2.5" fill="${signalColor}" />
    </g>
  </g>
  <g transform="translate(108, 0)">
    <text x="0" y="54" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="38" font-weight="800" fill="${textColor}" letter-spacing="-0.04em">Job<tspan fill="${textColor}" font-weight="500">whistle</tspan></text>
    <text x="2" y="76" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="9.5" font-weight="700" fill="${endorsementColor}" letter-spacing="0.28em">BY CODEBRISE</text>
  </g>
</svg>`;
}

/**
 * Stacked Logo SVG Generator
 */
function getStackedLogoSvg(opts = {}) {
  const {
    whistleFill = COLORS.signalLime,
    signalColor = COLORS.signalLime,
    apertureFill = COLORS.deepPine,
    textColor = COLORS.deepPine,
    endorsementColor = COLORS.sage,
    background = null,
    width = 240,
    height = 240,
  } = opts;

  const bgRect = background
    ? `<rect width="${width}" height="${height}" rx="24" fill="${background}" />`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgRect}
  <g transform="translate(70, 24)">
    <g transform="scale(1.0)">
      <path d="M 52 30 A 28 28 0 0 1 76 54" fill="none" stroke="${signalColor}" stroke-width="4.5" stroke-linecap="round" opacity="0.45" />
      <path d="M 57 23 A 38 38 0 0 1 88 54" fill="none" stroke="${signalColor}" stroke-width="4" stroke-linecap="round" opacity="0.75" />
      <path d="M 62 16 A 48 48 0 0 1 97 51" fill="none" stroke="${signalColor}" stroke-width="3.5" stroke-linecap="round" opacity="1" />
      <path d="M 12 50 L 36 50 L 36 68 L 12 68 C 9.5 68 8 66 8 63.5 L 8 54.5 C 8 52 9.5 50 12 50 Z" fill="${whistleFill}" />
      <circle cx="48" cy="59" r="19" fill="${whistleFill}" />
      <path d="M 36 50 L 44 38 L 52 38 L 48 50 Z" fill="${whistleFill}" />
      <polygon points="40,49 46,39 48,49" fill="${apertureFill}" opacity="0.9" />
      <circle cx="48" cy="59" r="7.5" fill="${apertureFill}" />
      <circle cx="48" cy="38" r="2.5" fill="${signalColor}" />
    </g>
  </g>
  <g transform="translate(120, 155)">
    <text text-anchor="middle" y="24" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="28" font-weight="800" fill="${textColor}" letter-spacing="-0.03em">Job<tspan fill="${textColor}" font-weight="500">whistle</tspan></text>
    <text text-anchor="middle" y="48" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="8.5" font-weight="700" fill="${endorsementColor}" letter-spacing="0.25em">BY CODEBRISE</text>
  </g>
</svg>`;
}

async function exportSvgAndPng(svgString, svgPath, pngPath, width, height) {
  fs.writeFileSync(svgPath, svgString, 'utf8');
  await sharp(Buffer.from(svgString))
    .resize(width, height)
    .png()
    .toFile(pngPath);
}

async function main() {
  console.log('Generating Jobwhistle Brand Assets...');

  // 1. Primary Logos
  // Dark on transparent
  const primaryLightLogoSvg = getHorizontalLogoSvg({
    whistleFill: COLORS.deepPine,
    signalColor: COLORS.signalTeal,
    apertureFill: COLORS.pureWhite,
    textColor: COLORS.deepPine,
    endorsementColor: COLORS.signalTeal,
  });
  await exportSvgAndPng(
    primaryLightLogoSvg,
    path.join(assetsDir, 'brand/logo/primary/jobwhistle-logo-horizontal.svg'),
    path.join(assetsDir, 'brand/logo/primary/jobwhistle-logo-horizontal.png'),
    880,
    200
  );

  // Lime on dark
  const primaryDarkLogoSvg = getHorizontalLogoSvg({
    whistleFill: COLORS.signalLime,
    signalColor: COLORS.signalLime,
    apertureFill: COLORS.deepPine,
    textColor: COLORS.pureWhite,
    endorsementColor: COLORS.sage,
    background: COLORS.darkSurface,
  });
  await exportSvgAndPng(
    primaryDarkLogoSvg,
    path.join(assetsDir, 'brand/logo/dark/jobwhistle-logo-dark.svg'),
    path.join(assetsDir, 'brand/logo/dark/jobwhistle-logo-dark.png'),
    880,
    200
  );

  // Light with background
  const lightBgLogoSvg = getHorizontalLogoSvg({
    whistleFill: COLORS.deepPine,
    signalColor: COLORS.signalTeal,
    apertureFill: COLORS.pureWhite,
    textColor: COLORS.deepPine,
    endorsementColor: COLORS.signalTeal,
    background: COLORS.lightBg,
  });
  await exportSvgAndPng(
    lightBgLogoSvg,
    path.join(assetsDir, 'brand/logo/light/jobwhistle-logo-light.svg'),
    path.join(assetsDir, 'brand/logo/light/jobwhistle-logo-light.png'),
    880,
    200
  );

  // Stacked Logo
  const stackedSvg = getStackedLogoSvg({
    whistleFill: COLORS.signalLime,
    signalColor: COLORS.signalLime,
    apertureFill: COLORS.deepPine,
    textColor: COLORS.pureWhite,
    endorsementColor: COLORS.sage,
    background: COLORS.darkSurface,
  });
  await exportSvgAndPng(
    stackedSvg,
    path.join(assetsDir, 'brand/logo/primary/jobwhistle-logo-stacked.svg'),
    path.join(assetsDir, 'brand/logo/primary/jobwhistle-logo-stacked.png'),
    480,
    480
  );

  // Monochrome Black
  const monoBlackSvg = getHorizontalLogoSvg({
    whistleFill: COLORS.pureBlack,
    signalColor: COLORS.pureBlack,
    apertureFill: COLORS.pureWhite,
    textColor: COLORS.pureBlack,
    endorsementColor: COLORS.pureBlack,
  });
  await exportSvgAndPng(
    monoBlackSvg,
    path.join(assetsDir, 'brand/logo/monochrome/jobwhistle-logo-black.svg'),
    path.join(assetsDir, 'brand/logo/monochrome/jobwhistle-logo-black.png'),
    880,
    200
  );

  // Monochrome White
  const monoWhiteSvg = getHorizontalLogoSvg({
    whistleFill: COLORS.pureWhite,
    signalColor: COLORS.pureWhite,
    apertureFill: COLORS.pureBlack,
    textColor: COLORS.pureWhite,
    endorsementColor: COLORS.pureWhite,
  });
  await exportSvgAndPng(
    monoWhiteSvg,
    path.join(assetsDir, 'brand/logo/monochrome/jobwhistle-logo-white.svg'),
    path.join(assetsDir, 'brand/logo/monochrome/jobwhistle-logo-white.png'),
    880,
    200
  );

  // 2. Symbols
  // Standalone Symbol (transparent)
  const symbolLimeSvg = getSymbolSvg({
    whistleFill: COLORS.signalLime,
    signalColor: COLORS.signalLime,
    apertureFill: COLORS.deepPine,
  });
  await exportSvgAndPng(
    symbolLimeSvg,
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-lime.svg'),
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-lime.png'),
    512,
    512
  );

  const symbolPineSvg = getSymbolSvg({
    whistleFill: COLORS.deepPine,
    signalColor: COLORS.signalTeal,
    apertureFill: COLORS.pureWhite,
  });
  await exportSvgAndPng(
    symbolPineSvg,
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-pine.svg'),
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-pine.png'),
    512,
    512
  );

  // App Symbol on Deep Pine Background
  const appSymbolSvg = getSymbolSvg({
    whistleFill: COLORS.signalLime,
    signalColor: COLORS.signalLime,
    apertureFill: COLORS.deepPine,
    background: COLORS.deepPine,
  });
  await exportSvgAndPng(
    appSymbolSvg,
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-app.svg'),
    path.join(assetsDir, 'brand/symbol/jobwhistle-symbol-app.png'),
    1024,
    1024
  );

  // 3. Wordmarks
  const wordmarkDark = getWordmarkSvg({ textColor: COLORS.deepPine, taglineColor: COLORS.signalTeal });
  await exportSvgAndPng(
    wordmarkDark,
    path.join(assetsDir, 'brand/wordmark/jobwhistle-wordmark-dark.svg'),
    path.join(assetsDir, 'brand/wordmark/jobwhistle-wordmark-dark.png'),
    640,
    160
  );

  const wordmarkLight = getWordmarkSvg({ textColor: COLORS.pureWhite, taglineColor: COLORS.sage });
  await exportSvgAndPng(
    wordmarkLight,
    path.join(assetsDir, 'brand/wordmark/jobwhistle-wordmark-light.svg'),
    path.join(assetsDir, 'brand/wordmark/jobwhistle-wordmark-light.png'),
    640,
    160
  );

  // 4. Favicons & Web Icons
  const faviconSvg = getSymbolSvg({
    whistleFill: COLORS.signalLime,
    signalColor: COLORS.signalLime,
    apertureFill: COLORS.deepPine,
    background: COLORS.deepPine,
    size: 64,
  });
  fs.writeFileSync(path.join(assetsDir, 'icons/favicon/favicon.svg'), faviconSvg, 'utf8');

  const faviconSizes = [16, 32, 48, 180, 192, 512];
  for (const s of faviconSizes) {
    const filename =
      s === 180
        ? 'apple-touch-icon.png'
        : s === 192
          ? 'android-chrome-192x192.png'
          : s === 512
            ? 'android-chrome-512x512.png'
            : `favicon-${s}x${s}.png`;
    await sharp(Buffer.from(faviconSvg))
      .resize(s, s)
      .png()
      .toFile(path.join(assetsDir, `icons/favicon/${filename}`));
  }

  // Create favicon.ico using 32x32 buffer
  const icoBuffer = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(assetsDir, 'icons/favicon/favicon.ico'), icoBuffer);

  // Maskable icon (with padding safe-zone for Android/PWA)
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="${COLORS.deepPine}" />
    <g transform="translate(64, 64) scale(3.84)">
      ${getSymbolSvg({ whistleFill: COLORS.signalLime, signalColor: COLORS.signalLime, apertureFill: COLORS.deepPine })}
    </g>
  </svg>`;
  fs.writeFileSync(path.join(assetsDir, 'app-icons/pwa/maskable-icon-512x512.svg'), maskableSvg, 'utf8');
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(assetsDir, 'app-icons/pwa/maskable-icon-512x512.png'));

  // 5. Mobile App Icons
  // Master Icon 1024x1024
  await sharp(Buffer.from(appSymbolSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'app-icons/master/master-icon-1024x1024.png'));

  // Android adaptive background & foreground
  const androidBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432"><rect width="432" height="432" fill="${COLORS.deepPine}" /></svg>`;
  const androidFgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
    <g transform="translate(108, 108) scale(2.16)">
      ${getSymbolSvg({ whistleFill: COLORS.signalLime, signalColor: COLORS.signalLime, apertureFill: COLORS.deepPine })}
    </g>
  </svg>`;
  fs.writeFileSync(path.join(assetsDir, 'app-icons/android/adaptive-background.svg'), androidBgSvg, 'utf8');
  fs.writeFileSync(path.join(assetsDir, 'app-icons/android/adaptive-foreground.svg'), androidFgSvg, 'utf8');
  await sharp(Buffer.from(androidBgSvg)).resize(432, 432).png().toFile(path.join(assetsDir, 'app-icons/android/adaptive-background.png'));
  await sharp(Buffer.from(androidFgSvg)).resize(432, 432).png().toFile(path.join(assetsDir, 'app-icons/android/adaptive-foreground.png'));

  // Android mipmaps
  const androidMipmaps = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 },
    { name: 'playstore-icon-512', size: 512 },
  ];
  for (const m of androidMipmaps) {
    await sharp(Buffer.from(appSymbolSvg))
      .resize(m.size, m.size)
      .png()
      .toFile(path.join(assetsDir, `app-icons/android/${m.name}.png`));
  }

  // iOS App store & icons
  const iosIcons = [
    { name: 'app-store-1024', size: 1024 },
    { name: 'iphone-180', size: 180 },
    { name: 'iphone-120', size: 120 },
    { name: 'iphone-87', size: 87 },
    { name: 'ipad-167', size: 167 },
    { name: 'ipad-152', size: 152 },
  ];
  for (const i of iosIcons) {
    await sharp(Buffer.from(appSymbolSvg))
      .resize(i.size, i.size)
      .png()
      .toFile(path.join(assetsDir, `app-icons/ios/${i.name}.png`));
  }

  // 6. Social & Marketing Assets
  // Open Graph Image (1200x630)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${COLORS.darkSurface}" />
  <circle cx="1050" cy="120" r="350" fill="${COLORS.signalTeal}" opacity="0.12" />
  <circle cx="150" cy="550" r="280" fill="${COLORS.signalLime}" opacity="0.08" />
  <g transform="translate(100, 100)">
    <!-- Symbol -->
    <g transform="scale(1.2)">
      ${getSymbolSvg({ whistleFill: COLORS.signalLime, signalColor: COLORS.signalLime, apertureFill: COLORS.darkSurface })}
    </g>
    <g transform="translate(140, 15)">
      <text x="0" y="55" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="52" font-weight="800" fill="${COLORS.pureWhite}" letter-spacing="-0.03em">Job<tspan font-weight="500">whistle</tspan></text>
      <text x="4" y="85" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="12" font-weight="700" fill="${COLORS.sage}" letter-spacing="0.3em">BY CODEBRISE</text>
    </g>
  </g>
  <g transform="translate(100, 270)">
    <text x="0" y="50" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="64" font-weight="700" fill="${COLORS.signalLime}" letter-spacing="-0.03em">Know when something</text>
    <text x="0" y="125" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="64" font-weight="700" fill="${COLORS.pureWhite}" letter-spacing="-0.03em">goes quiet.</text>
    <text x="0" y="190" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="24" font-weight="400" fill="${COLORS.sage}">Lightweight website uptime, API endpoints, and scheduled-job monitoring.</text>
  </g>
  <g transform="translate(100, 530)">
    <rect width="140" height="38" rx="8" fill="${COLORS.deepPine}" stroke="${COLORS.borderDark}" stroke-width="1.5" />
    <circle cx="20" cy="19" r="5" fill="${COLORS.statusUp}" />
    <text x="35" y="24" font-family="system-ui, -apple-system, 'Geist Mono', monospace" font-size="13" font-weight="600" fill="${COLORS.pureWhite}">HTTP 200 OK</text>
    
    <rect x="160" width="140" height="38" rx="8" fill="${COLORS.deepPine}" stroke="${COLORS.borderDark}" stroke-width="1.5" />
    <circle cx="180" cy="19" r="5" fill="${COLORS.signalLime}" />
    <text x="195" y="24" font-family="system-ui, -apple-system, 'Geist Mono', monospace" font-size="13" font-weight="600" fill="${COLORS.pureWhite}">CRON IN-TIME</text>

    <rect x="320" width="165" height="38" rx="8" fill="${COLORS.deepPine}" stroke="${COLORS.borderDark}" stroke-width="1.5" />
    <circle cx="340" cy="19" r="5" fill="${COLORS.signalTeal}" />
    <text x="355" y="24" font-family="system-ui, -apple-system, 'Geist Mono', monospace" font-size="13" font-weight="600" fill="${COLORS.pureWhite}">ZERO DOWNTIME</text>
  </g>
</svg>`;
  await exportSvgAndPng(
    ogSvg,
    path.join(assetsDir, 'social/og-image.svg'),
    path.join(assetsDir, 'social/og-image.png'),
    1200,
    630
  );

  // Twitter/X Card (1200x600)
  await sharp(Buffer.from(ogSvg))
    .resize(1200, 600)
    .png()
    .toFile(path.join(assetsDir, 'social/twitter-card.png'));

  // GitHub Social Preview (1280x640)
  await sharp(Buffer.from(ogSvg))
    .resize(1280, 640)
    .png()
    .toFile(path.join(assetsDir, 'social/github-social.png'));

  // Email Header Artwork (600x140)
  const emailHeaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 140" width="600" height="140">
  <rect width="600" height="140" fill="${COLORS.deepPine}" />
  <g transform="translate(40, 30)">
    <g transform="scale(0.8)">
      ${getSymbolSvg({ whistleFill: COLORS.signalLime, signalColor: COLORS.signalLime, apertureFill: COLORS.deepPine })}
    </g>
    <g transform="translate(100, 12)">
      <text x="0" y="38" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="32" font-weight="800" fill="${COLORS.pureWhite}" letter-spacing="-0.03em">Job<tspan font-weight="500">whistle</tspan></text>
      <text x="2" y="56" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="9" font-weight="700" fill="${COLORS.sage}" letter-spacing="0.25em">BY CODEBRISE</text>
    </g>
  </g>
</svg>`;
  await exportSvgAndPng(
    emailHeaderSvg,
    path.join(assetsDir, 'email/email-header.svg'),
    path.join(assetsDir, 'email/email-header.png'),
    600,
    140
  );

  // 7. Empty State Illustrations
  // Empty Monitors
  const emptyMonitorsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
    <rect width="400" height="260" fill="none" />
    <rect x="80" y="40" width="240" height="160" rx="16" fill="${COLORS.deepPine}" stroke="${COLORS.borderDark}" stroke-width="2" />
    <circle cx="106" cy="64" r="6" fill="${COLORS.statusDown}" opacity="0.6" />
    <circle cx="124" cy="64" r="6" fill="${COLORS.statusDegraded}" opacity="0.6" />
    <circle cx="142" cy="64" r="6" fill="${COLORS.statusUp}" opacity="0.6" />
    <line x1="80" y1="84" x2="320" y2="84" stroke="${COLORS.borderDark}" stroke-width="1.5" />
    <g transform="translate(160, 105) scale(0.8)">
      ${getSymbolSvg({ whistleFill: COLORS.signalLime, signalColor: COLORS.signalLime, apertureFill: COLORS.deepPine })}
    </g>
    <text x="200" y="230" text-anchor="middle" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="14" font-weight="500" fill="${COLORS.sage}">No HTTP monitors configured yet</text>
  </svg>`;
  await exportSvgAndPng(
    emptyMonitorsSvg,
    path.join(assetsDir, 'illustrations/empty-monitors.svg'),
    path.join(assetsDir, 'illustrations/empty-monitors.png'),
    400,
    260
  );

  // Empty Heartbeats
  const emptyHeartbeatsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
    <rect width="400" height="260" fill="none" />
    <circle cx="200" cy="110" r="60" fill="${COLORS.deepPine}" stroke="${COLORS.borderDark}" stroke-width="2" />
    <path d="M 160 110 L 180 110 L 190 90 L 205 130 L 215 105 L 225 110 L 240 110" fill="none" stroke="${COLORS.signalLime}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <text x="200" y="215" text-anchor="middle" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="14" font-weight="500" fill="${COLORS.sage}">No cron heartbeats listening</text>
  </svg>`;
  await exportSvgAndPng(
    emptyHeartbeatsSvg,
    path.join(assetsDir, 'illustrations/empty-heartbeats.svg'),
    path.join(assetsDir, 'illustrations/empty-heartbeats.png'),
    400,
    260
  );

  // Empty Incidents (Calm / Green state)
  const emptyIncidentsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
    <rect width="400" height="260" fill="none" />
    <circle cx="200" cy="110" r="54" fill="${COLORS.deepPine}" stroke="${COLORS.statusUp}" stroke-width="2" />
    <path d="M 180 110 L 194 124 L 222 96" fill="none" stroke="${COLORS.statusUp}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <text x="200" y="200" text-anchor="middle" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="15" font-weight="600" fill="${COLORS.pureWhite}">All services operational</text>
    <text x="200" y="222" text-anchor="middle" font-family="system-ui, -apple-system, 'Geist', sans-serif" font-size="13" font-weight="400" fill="${COLORS.sage}">Zero active incidents detected</text>
  </svg>`;
  await exportSvgAndPng(
    emptyIncidentsSvg,
    path.join(assetsDir, 'illustrations/empty-incidents.svg'),
    path.join(assetsDir, 'illustrations/empty-incidents.png'),
    400,
    260
  );

  console.log('Successfully generated all brand assets!');
}

main().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});

