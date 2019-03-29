import { readFileSync } from 'fs'

type XrpMemo = {
  type?: string
  format?: string
  data?: string
}

type Memo = {
  relation?: LinkRelations
  mimeType?: MimeTypes
  data: Buffer
}

export enum LinkRelations {
  'client' = 'client'
}

export enum MimeTypes {
  'png' = 'image/png',
  'html' = 'text/html',
  'gz' = 'application/gzip'
}

function encodeMemo (memo: Memo): XrpMemo {
  return {
    type: memo.relation ? Buffer.from(memo.relation, 'ascii').toString('hex') : undefined,
    format: memo.mimeType ? Buffer.from(memo.mimeType, 'ascii').toString('hex') : undefined,
    data: memo.data.toString('hex')
  }
}

function htmlMemo (text: string): XrpMemo {
  return encodeMemo({
    mimeType: MimeTypes.html,
    data: Buffer.from(text, 'utf8')
  })
}

function binaryMemo (filePath: string, mimeType: MimeTypes): XrpMemo {
  try {
    const data = readFileSync(filePath)
    if (data.length > 1024) {
      // See: https://github.com/ripple/rippled/blob/eed210bb67611aa36bdadfe14bfefb345d78a691/src/ripple/protocol/impl/STTx.cpp#L401
      throw new Error('Memo can\'t be greater than 1024 bytes')
    }
    return encodeMemo({
      data,
      mimeType
    })
  } catch (e) {
    console.error(`Error reading in file: ${filePath}`)
    console.error(e)
    return htmlMemo(filePath)
  }
}

/**
 * If the input is a file path then get the file otherwise treat as HTML
 * @param input either a file path to a PNG file or a some text to treat as HTML
 */
export function parseMemo (input?: string): Array<XrpMemo> {

  if (!input) return []

  const extensions = Object.keys(MimeTypes).filter(extension => input.endsWith(`.${extension}`)) as Array<keyof typeof MimeTypes>
  if (extensions.length) {
    const mimeType = extensions[0]
    return [binaryMemo(input, MimeTypes[mimeType])]
  } else {
    console.log(Object.keys(MimeTypes))
    process.exit(1)
    return [htmlMemo(input)]
  }
}
