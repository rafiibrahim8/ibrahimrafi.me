/**
 * LSB image steganography, browser-side. Payload format:
 *   4 bytes magic "IRme" · 4 bytes length (little-endian) · UTF-8 message
 * written sequentially into the least significant bits of R, G, B channels
 * (alpha untouched). Spiritual successor to iSteg (2018).
 */

const MAGIC = new Uint8Array([0x49, 0x52, 0x6d, 0x65]); // "IRme"
const HEADER_BYTES = 8;

export function capacityBytes(width: number, height: number): number {
  return Math.max(0, Math.floor((width * height * 3) / 8) - HEADER_BYTES);
}

function writeBits(data: Uint8ClampedArray, payload: Uint8Array): void {
  let bit = 0;
  for (const byte of payload) {
    for (let i = 7; i >= 0; i--) {
      // map payload bit index → pixel channel index, skipping alpha (every 4th)
      const channel = Math.floor(bit / 3) * 4 + (bit % 3);
      data[channel] = (data[channel]! & 0xfe) | ((byte >> i) & 1);
      bit++;
    }
  }
}

function readBytes(
  data: Uint8ClampedArray,
  count: number,
  startBit = 0,
): Uint8Array {
  const out = new Uint8Array(count);
  let bit = startBit;
  for (let i = 0; i < count; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      const channel = Math.floor(bit / 3) * 4 + (bit % 3);
      b = (b << 1) | (data[channel]! & 1);
      bit++;
    }
    out[i] = b;
  }
  return out;
}

export function encode(image: ImageData, message: string): void {
  const msgBytes = new TextEncoder().encode(message);
  const cap = capacityBytes(image.width, image.height);
  if (msgBytes.length > cap) {
    throw new Error(
      `Message is ${msgBytes.length.toLocaleString()} bytes but this image can only hold ${cap.toLocaleString()}. Use a bigger image or a shorter message.`,
    );
  }
  const payload = new Uint8Array(HEADER_BYTES + msgBytes.length);
  payload.set(MAGIC, 0);
  new DataView(payload.buffer).setUint32(4, msgBytes.length, true);
  payload.set(msgBytes, HEADER_BYTES);
  writeBits(image.data, payload);
}

export function decode(image: ImageData): string | null {
  const header = readBytes(image.data, HEADER_BYTES);
  if (!MAGIC.every((b, i) => header[i] === b)) return null;
  const length = new DataView(header.buffer).getUint32(4, true);
  const cap = capacityBytes(image.width, image.height);
  if (length === 0 || length > cap) return null;
  const msg = readBytes(image.data, length, HEADER_BYTES * 8);
  return new TextDecoder().decode(msg);
}
