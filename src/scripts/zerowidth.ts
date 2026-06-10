/**
 * Zero-width steganography: encode text as a run of invisible Unicode
 * characters. U+200B (zero-width space) = 0, U+200C (zero-width non-joiner) = 1.
 * Used at build time to hide the easter-egg message in the homepage, and at
 * runtime by the /steg decoder.
 */

const ZW0 = '​';
const ZW1 = '‌';

export function zwEncode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let out = '';
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      out += (byte >> i) & 1 ? ZW1 : ZW0;
    }
  }
  return out;
}

export function zwDecode(text: string): string {
  const bits: number[] = [];
  for (const ch of text) {
    if (ch === ZW0) bits.push(0);
    else if (ch === ZW1) bits.push(1);
  }
  if (bits.length < 8) return '';
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j]!;
    }
    bytes[i] = b;
  }
  return new TextDecoder().decode(bytes);
}
