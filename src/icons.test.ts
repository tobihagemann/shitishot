import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The icons are written by `pnpm icon`, which only runs on a Mac with Xcode, so these check what it left behind.
const file = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url));

/** The first tag in `path` that matches `tag`, and a reader for its attributes. */
function markup(path: string, tag: RegExp) {
  const source = tag.exec(file(path).toString())![0];
  return (name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(source)![1]!;
}

/** Width, height and color type from a PNG's IHDR, whose data starts at byte 16. Color type 2 is RGB, 6 is RGBA. */
function pngHeader(png: Buffer) {
  expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), colorType: png.readUInt8(25) };
}

describe('icons', () => {
  it('declares the header logo at the size of its 1x image, with a 2x image of exactly double', () => {
    const attribute = markup('src/App.vue', /<img\b[^>]*logo-nav\.png[^>]*>/);
    const declared = { width: Number(attribute('width')), height: Number(attribute('height')) };

    expect(pngHeader(file('public/assets/logo-nav.png'))).toMatchObject(declared);
    expect(pngHeader(file('public/assets/logo-nav@2x.png'))).toMatchObject({ width: 2 * declared.width, height: 2 * declared.height });
  });

  it('ships an opaque touch icon, since iOS paints a transparent corner black', () => {
    expect(pngHeader(file('public/apple-touch-icon.png'))).toEqual({ width: 180, height: 180, colorType: 2 });
  });

  it('packs favicon.ico with a PNG of each size index.html declares', () => {
    const ico = file('public/favicon.ico');
    // ICONDIR: reserved 0, type 1 (icon), the image count, then one 16-byte entry per image naming its size, length,
    // and offset.
    expect([ico.readUInt16LE(0), ico.readUInt16LE(2)]).toEqual([0, 1]);
    const entries = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
      const entry = 6 + 16 * index;
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      const png = pngHeader(ico.subarray(offset, offset + length));
      return { entry: `${ico.readUInt8(entry)}x${ico.readUInt8(entry + 1)}`, png: `${png.width}x${png.height}` };
    });
    const declared = markup('index.html', /<link\b[^>]*href="\/favicon\.ico"[^>]*>/)('sizes').split(' ');

    expect(entries).toEqual(declared.map((size) => ({ entry: size, png: size })));
  });
});
