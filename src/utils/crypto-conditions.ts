import { createHash } from 'crypto'

/**
 * Generate and encode a PreimageSha256 crypto-condition from a secret
 *
 * The function decodes the provided secret using utf8 and uses this as the preimage.
 *
 * @param secret the secret to use as a preimage
 */
export function preimageSha256 (secret: string): {
  condition: Buffer
  fulfillment: Buffer
} {
  const preimage = Buffer.from(secret, 'utf8')
  return {
    condition: encodeCondition(encodeFingerprint(preimage), encodeCost(preimage.length)),
    fulfillment: encodeFulfillment(encodePreimage(preimage))
  }
}

function encodeCondition (encodedFingerprint: Buffer, encodedCost: Buffer): Buffer {
  return Buffer.concat([Buffer.of(0xA0, encodedFingerprint.length + encodedCost.length), encodedFingerprint, encodedCost])
}

function encodeFulfillment (encodedPreimage: Buffer): Buffer {
  const size = encodedPreimage.length
  const length = (size > 127) ? encodeInteger(size) : Buffer.of(size)
  return Buffer.concat([Buffer.of(0xA0), length, encodedPreimage])
}

function encodeFingerprint (preimage: Buffer): Buffer {
  return Buffer.concat([Buffer.of(0x80, 32), createHash('sha256').update(preimage).digest()])
}

function encodePreimage (preimage: Buffer): Buffer {
  const size = preimage.length
  const length = (size > 127) ? encodeInteger(size) : Buffer.of(size)
  return Buffer.concat([Buffer.of(0x80), length, preimage])
}

function encodeCost (cost: number): Buffer {
  return Buffer.concat([Buffer.of(0x81), encodeInteger(cost)])
}

function encodeInteger (val: number): Buffer {
  if (val < 0x100) {
    const buffer = Buffer.allocUnsafe(2)
    buffer.writeUInt8(1, 0)
    buffer.writeUInt8(val, 1)
    return buffer
  }
  if (val < 0x10000) { // 2 bytes
    const buffer = Buffer.allocUnsafe(3)
    buffer.writeUInt8(2, 0)
    buffer.writeUInt16BE(val, 1)
    return buffer
  }
  if (val < 0x1000000) { // 3 bytes
    const buffer = Buffer.allocUnsafe(4)
    buffer.writeUInt8(3, 0)
    buffer.writeUIntBE(val, 1, 3)
    return buffer
  }
  if (val < 0x100000000) { // 4 bytes
    const buffer = Buffer.allocUnsafe(5)
    buffer.writeUInt8(4, 0)
    buffer.writeUInt32BE(val, 1)
    return buffer
  }
  if (val < 0x10000000000) { // 5 bytes
    const buffer = Buffer.allocUnsafe(6)
    buffer.writeUInt8(5, 0)
    buffer.writeUIntBE(val, 1, 5)
    return buffer
  }
  if (val < 0x1000000000000) { // 6 bytes
    const buffer = Buffer.allocUnsafe(7)
    buffer.writeUInt8(6, 0)
    buffer.writeUIntBE(val, 1, 6)
    return buffer
  }
  throw new Error('value is too high. cant encode values higher than 6 bytes. value=' + val)
}
