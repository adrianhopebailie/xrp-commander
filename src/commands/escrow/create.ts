import { preimageSha256 } from '../../utils/crypto-conditions'
import { Options } from 'yargs'
import { api, getXrpAddressAndSecret, signSubmitVerify, timeFromNowInXrpTime } from '../../utils/xrp'

export type Params = {
  amount: string
  destination: string
  password: string
  allowCancelAfter: string
  memo?: string
}
export const command = 'create <amount> <destination> <password> <allowCancelAfter> [memo]'
export const describe = `Create an escrow on the XRP ledger`
export const builder: { [key: string]: Options } = {
  amount: {
    type: 'number',
    required: true,
    description: 'amount to put in escrow'
  },
  destination: {
    type: 'string',
    required: true,
    description: 'recipient of the escrow'
  },
  password: {
    type: 'string',
    required: true,
    description: 'password required to release the escrow'
  },
  allowCancelAfter: {
    type: 'string',
    required: true,
    description: 'date-time in the future after which the escrow can be cancelled (ISO 8601 format)'
  },
  memo: {
    type: 'string',
    required: false,
    description: 'memo to include in the transaction'
  }

}

export async function handler ({ amount, destination, password, allowCancelAfter, memo }: Params) {

  const { address, secret } = await getXrpAddressAndSecret()
  console.log(`Creating condition from password: ${password}`)
  const condition = preimageSha256(password).condition.toString('hex').toUpperCase()
  console.log(`Crypto-condition: ${condition}`)
  const memos = (memo) ? [{
    type: 'text/html',
    data: Buffer.from(memo, 'utf8').toString('hex')
  }] : []

  const prepared = await (await api()).prepareEscrowCreation(address, {
    amount: amount.toString(),
    destination,
    condition,
    memos,
    allowCancelAfter
  })
  console.log('Escrow transaction prepared...')

  const result = await signSubmitVerify(prepared, secret)

  console.log(JSON.stringify(result, null, 2))

  if (result.outcome.result === 'tesSUCCESS') {
    console.log('Escrow created! To release call:')
    console.log(`> xrp escrow release ${result.address} ${result.sequence} ${password}`)
    process.exit(0)
  }
  process.exit(1)
}
