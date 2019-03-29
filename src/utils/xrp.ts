import { prompt } from 'inquirer'
import { RippleAPI } from 'ripple-lib'

const address = process.env.XRP_ADDRESS
const secret = process.env.XRP_SECRET
const server = process.env.XRP_SERVER || 'wss://s1.ripple.com:443'

const _api = new RippleAPI({ server })
let _connected = false
export const api = async () => {
  if (!_connected || !_api.isConnected()) {
    console.log('Connecting to ' + server)
    await _api.connect()
    _connected = true
  }
  return _api
}

export type PreparedTransaction = {
  txJSON: string;
  instructions: {
    fee: string;
    sequence: number;
    maxLedgerVersion?: number;
  }
}

export type SubmitResult = {
  resultCode: string;
  resultMessage: string;
}

export function timeFromNowInXrpTime (seconds: number) {
  const rippleOffset = 946684800
  return Math.floor(Date.now() / 1000) + seconds - rippleOffset
}

export async function getXrpAddress (): Promise<string> {

  if (address) {
    return address
  }
  if (secret) {
    return getAddressFromSecret(secret)
  }

  // TODO: Look in default config file ~/.xrp

  return getAddressFromSecret(await promptForSecret())
}

export async function getXrpAddressAndSecret (): Promise<{ address: string, secret: string }> {

  if (secret) {
    if (address) {
      return { address, secret }
    }
    return { address: getAddressFromSecret(secret), secret }
  }

  // TODO: Look in default config file ~/.xrp

  const providedSecret = await promptForSecret()
  return { address: getAddressFromSecret(providedSecret), secret: providedSecret }
}

export async function signSubmitVerify (prepared: PreparedTransaction, secret: string, timeout: number = 3000) {

  const minLedgerVersion = await (await api()).getLedgerVersion()
  console.log(`Ledger: ${minLedgerVersion}`)

  const { id, signedTransaction } = (await api()).sign(prepared.txJSON, secret)
  console.log(`Transaction signed. ID: ${id}`)

  const result = await (await api()).submit(signedTransaction)
  console.log(`${result.resultCode} ${result.resultMessage}`)

  console.log(`Verifying transaction... (waiting ${timeout} milliseconds)`)
  await new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })

  let retries = 5
  while (retries > 0) {
    try {
      const maxLedgerVersion = await (await api()).getLedgerVersion()
      console.log(`Ledger: ${minLedgerVersion}`)

      return await (await api()).getTransaction(id, {
        minLedgerVersion,
        maxLedgerVersion
      })

    } catch (e) {
      if (e.name === 'NotFoundError') {
        console.log(`Not found. Waiting for another ${timeout} milliseconds`)
        await new Promise((resolve) => {
          setTimeout(resolve, timeout)
        })
        retries--
      } else {
        throw e
      }
    }
  }

  throw new Error('tx not found')
}

export function getAddressFromSecret (secret: string) {
  if (!_api.isValidSecret(secret)) {
    throw new Error('invalid secret')
  }
  const { publicKey } = _api.deriveKeypair(secret)
  return _api.deriveAddress(publicKey)
}

export async function promptForSecret (): Promise<string> {
  const { secret } = await prompt([
    {
      type: 'input',
      name: 'secret',
      message: 'Please provide the XRP secret for the address you wish to send from:',
      validate: (secret: string) => {
        if (!_api.isValidSecret) {
          return 'Invalid secret: ' + secret
        }
        return true
      }
    }
  ])
  return secret
}
