#!/usr/bin/env node
// Generates the Five Minutes app icons into public/ from one geometric source.
//
// Usage: node scripts/generate-icons.mjs
//   Set CHROMIUM_PATH to use a specific Chromium build (otherwise Playwright's).
//
// The mark is pure geometry (a clock ring with a filled five-minute wedge), so
// output does not depend on installed fonts. This is a manual, occasional tool:
// the generated files are committed and the production build does not run it.
// When changing an icon, give the PNG files new names (and update
// public/manifest.webmanifest and BaseLayout.astro) so installed apps and
// browser caches pick up the change; see docs/OPERATIONS.md.
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BACKGROUND = '#1f5fbf';
const FOREGROUND = '#ffffff';

/**
 * @param {{ rounded: boolean }} options rounded corners for "any"-purpose icons;
 *   full-bleed squares for maskable and Apple touch icons (the platform masks them).
 */
function iconSvg({ rounded }) {
  // Wedge from 12 o'clock to 1 o'clock = 30 degrees = five minutes.
  const r = 120;
  const x = 256 + r * Math.sin(Math.PI / 6);
  const y = 256 - r * Math.cos(Math.PI / 6);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    `<rect width="512" height="512"${rounded ? ' rx="112"' : ''} fill="${BACKGROUND}"/>`,
    `<circle cx="256" cy="256" r="150" fill="none" stroke="${FOREGROUND}" stroke-width="36"/>`,
    `<path d="M256 256 L256 ${256 - r} A${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Z" fill="${FOREGROUND}"/>`,
    '</svg>',
  ].join('');
}

const outputs = [
  { file: 'public/icons/icon-192.png', size: 192, rounded: true },
  { file: 'public/icons/icon-512.png', size: 512, rounded: true },
  { file: 'public/icons/maskable-512.png', size: 512, rounded: false },
  { file: 'public/apple-touch-icon.png', size: 180, rounded: false },
];

await writeFile('public/favicon.svg', iconSvg({ rounded: true }) + '\n');

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  for (const { file, size, rounded } of outputs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${iconSvg({ rounded })}`,
    );
    await page.locator('svg').screenshot({ path: file, omitBackground: true });
    await page.close();
    console.log(`wrote ${file} (${size}x${size})`);
  }
} finally {
  await browser.close();
}
console.log('wrote public/favicon.svg');
