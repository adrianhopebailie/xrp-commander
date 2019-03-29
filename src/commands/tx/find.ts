import { Options } from 'yargs'
import { api } from '../../utils/xrp'

export type Params = {
  id: string
  minLedgerVersion?: number
  maxLedgerVersion?: number
}
export const command = 'find <id> [minLedgerVersion] [maxLedgerVersion]'
export const describe = `Find a transaction on the XRP ledger`
export const builder: { [key: string]: Options } = {
  id: {
    type: 'string',
    required: true,
    description: 'the id (hash) of the transaction'
  },
  minLedgerVersion: {
    type: 'number',
    description: 'the minimum (most recent) ledger to search'
  },
  maxLedgerVersion: {
    type: 'number',
    description: 'the maximum (oldest) ledger to search'
  }

}

export async function handler ({ id, minLedgerVersion, maxLedgerVersion }: Params) {

  if (!minLedgerVersion && !maxLedgerVersion) {
    maxLedgerVersion = await (await api()).getLedgerVersion()
    minLedgerVersion = maxLedgerVersion - 100
  }
  console.log(`Looking for tx after ledger ${minLedgerVersion} and before ${maxLedgerVersion}`)

  const result = await (await api()).getTransaction(id, {
    minLedgerVersion,
    maxLedgerVersion
  })

  console.log(JSON.stringify(result, null, 2))
  process.exit(0)

}
