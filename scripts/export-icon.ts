import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp, { type Sharp } from 'sharp';

// Renders the touch icon from the Icon Composer document, and the favicons and logos from its layers stacked flat. Only
// Apple's renderer draws the squircle and the glass on the flames, so this runs only on a Mac with Xcode installed.
const SOURCE = join(import.meta.dirname, '../brand/TheShitIsHot.icon');
const PUBLIC = join(import.meta.dirname, '../public');
// Resolved from the selected Xcode, so a renamed or beta install works too.
const ICTOOL = join(
  execFileSync('xcode-select', ['--print-path'], { encoding: 'utf8' }).trim(),
  '../Applications/Icon Composer.app/Contents/Executables/ictool',
);

// The size of the document's canvas, in points, which its layer SVGs share as their viewBox.
const CANVAS = 1024;
// The app icon is rendered at 2048 and resampled down, because its rim light is a hairline that a render at the final
// size would alias. The flat mark has none, so sharp draws its SVG straight at each size.
//
// The renderer tags its export Display P3, the space of the document's colors. So every step on the render keeps that
// profile rather than letting sharp clip the colors to sRGB.
const MASTER_SIZE = 2048;
const FAVICON_SIZES = [16, 32, 48];
const TOUCH_ICON_SIZE = 180;
const LOGO_SIZE = 256;
// Matches the header's h-7. App.vue hardcodes the resulting 1x width and height, so they change with the mark's aspect.
const NAV_HEIGHT = 28;
// The renderer masks every export to the squircle. Enlarging a render and cropping it back to size pushes the
// squircle's edge and rim light out of frame, which leaves a full-bleed background.
const ENLARGEMENT = 1.25;

type IconDocument = { groups: { layers: { name: string; 'image-name': string; fill?: { solid?: string } }[] }[] };

function render(): Buffer {
  const scratch = mkdtempSync(join(tmpdir(), 'shitishot-icon-'));
  try {
    const output = join(scratch, 'master.png');
    execFileSync(ICTOOL, [
      SOURCE,
      '--export-image',
      '--output-file',
      output,
      '--platform',
      'iOS',
      '--rendition',
      'Default',
      '--width',
      String(MASTER_SIZE / 2),
      '--height',
      String(MASTER_SIZE / 2),
      '--scale',
      '2',
      '--design-generation',
      '27',
    ]);
    return readFileSync(output);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/**
 * iOS masks a touch icon itself and paints a transparent corner black. So the render is laid over its own enlarged
 * center, which fills the corners with the background as the renderer lit it. The document's raw fill would not match
 * that lighting.
 */
async function touchIcon(master: Buffer): Promise<Buffer> {
  const enlarged = MASTER_SIZE * ENLARGEMENT;
  const inset = (enlarged - MASTER_SIZE) / 2;
  const backed = await sharp(master)
    .keepIccProfile()
    .resize(enlarged, enlarged)
    .extract({ left: inset, top: inset, width: MASTER_SIZE, height: MASTER_SIZE })
    .composite([{ input: master }])
    .removeAlpha()
    .png()
    .toBuffer();
  return resized(backed, TOUCH_ICON_SIZE).toBuffer();
}

/**
 * An icon.json color as sRGB hex. A Display P3 color is clipped channel by channel, as Tailwind clips its oklch tokens
 * to their hex fallbacks.
 */
function srgbHex(color: string): string {
  const [space, channels] = color.split(':') as [string, string];
  const [r, g, b] = channels.split(',').map(Number) as [number, number, number];
  const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  let rgb = [r, g, b];
  if (space === 'display-p3') {
    const [lr, lg, lb] = rgb.map(decode) as [number, number, number];
    const linear = [1.2249401 * lr - 0.2249404 * lg, -0.0420569 * lr + 1.0420571 * lg, -0.0196376 * lr - 0.0786361 * lg + 1.0982735 * lb];
    rgb = linear.map((c) => encode(Math.min(1, Math.max(0, c))));
  } else if (space !== 'srgb') {
    throw new Error(`Unsupported color space in ${color}`);
  }
  return `#${rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * The document's layers on a transparent canvas, without the squircle, background gradient or glass, each in its
 * icon.json fill clipped to sRGB. icon.json lists layers front to back, so they are reversed to stack back to front.
 * The fills stay out of the layer SVGs because librsvg draws `color(display-p3 …)` as black.
 */
async function flatMark(): Promise<{ square: string; tight: string; aspect: number }> {
  const icon = JSON.parse(readFileSync(join(SOURCE, 'icon.json'), 'utf8')) as IconDocument;
  const shapes = icon.groups
    .flatMap(({ layers }) => layers)
    .reverse()
    .map((layer) => {
      if (!layer.fill?.solid) throw new Error(`Layer ${layer.name} has no solid fill in icon.json`);
      const body = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(readFileSync(join(SOURCE, 'Assets', layer['image-name']), 'utf8'))![1]!;
      return body.trim().replace(/\bfill="[^"]*"/, `fill="${srgbHex(layer.fill.solid)}"`);
    });
  const svg = (viewBox: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n  ${shapes.join('\n  ')}\n</svg>\n`;
  // The mark's box, measured from a render at 2048 and converted to canvas units. sharp reports the trim offsets as
  // negative distances from the original edges.
  const { info } = await sharp(Buffer.from(svg(`0 0 ${CANVAS} ${CANVAS}`)), { density: (72 * MASTER_SIZE) / CANVAS })
    .trim()
    .toBuffer({ resolveWithObject: true });
  const unit = (pixels: number) => (pixels * CANVAS) / MASTER_SIZE;
  const [left, top, width, height] = [-info.trimOffsetLeft!, -info.trimOffsetTop!, info.width, info.height].map(unit) as [number, number, number, number];
  const viewBox = (box: number[]) => box.map((value) => Math.round(value * 100) / 100).join(' ');
  // The square box shares the mark's center, so the favicons draw it centered.
  const side = Math.max(width, height);
  const square = [left + width / 2 - side / 2, top + height / 2 - side / 2, side, side];
  return { square: svg(viewBox(square)), tight: svg(viewBox([left, top, width, height])), aspect: width / height };
}

/**
 * An ICO whose entries are PNGs, which every browser that still asks for `favicon.ico` reads. Its 6-byte header is
 * followed by one 16-byte directory entry per image: width, height, planes, bit depth, length and offset.
 */
function ico(entries: { size: number; png: Buffer }[]): Buffer {
  const directory = Buffer.alloc(6 + 16 * entries.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(entries.length, 4);
  let offset = directory.length;
  entries.forEach(({ size, png }, index) => {
    const entry = 6 + 16 * index;
    directory.writeUInt8(size, entry);
    directory.writeUInt8(size, entry + 1);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([directory, ...entries.map(({ png }) => png)]);
}

function resized(image: Buffer, width: number, height = width): Sharp {
  return sharp(image)
    .keepIccProfile()
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png();
}

writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), await touchIcon(render()));

// Browser tabs get the flat mark. The squircle app icon goes only to home screens.
const mark = await flatMark();
const square = Buffer.from(mark.square);
const tight = Buffer.from(mark.tight);
writeFileSync(join(PUBLIC, 'favicon.svg'), square);
const favicons = await Promise.all(FAVICON_SIZES.map(async (size) => ({ size, png: await resized(square, size).toBuffer() })));
writeFileSync(join(PUBLIC, 'favicon.ico'), ico(favicons));
await resized(square, LOGO_SIZE).toFile(join(PUBLIC, 'assets/logo.png'));
const navWidth = Math.round(NAV_HEIGHT * mark.aspect);
await resized(tight, navWidth, NAV_HEIGHT).toFile(join(PUBLIC, 'assets/logo-nav.png'));
await resized(tight, 2 * navWidth, 2 * NAV_HEIGHT).toFile(join(PUBLIC, 'assets/logo-nav@2x.png'));

console.log(`Rendered the icons and logos into ${PUBLIC}`);
