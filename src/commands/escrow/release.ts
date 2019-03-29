import { preimageSha256 } from '../../utils/crypto-conditions'
import { Options } from 'yargs'
import { api, getXrpAddressAndSecret, signSubmitVerify, timeFromNowInXrpTime } from '../../utils/xrp'

export type Params = {
  owner: string
  sequence: number
  password: string
  memo?: string
}
export const command = 'release <owner> <sequence> <password> [memo]'
export const describe = `Release an escrow on the XRP ledger`
export const builder: { [key: string]: Options } = {
  owner: {
    type: 'string',
    required: true,
    description: 'address of the creator of the escrow'
  },
  sequence: {
    type: 'number',
    required: true,
    description: 'tx sequence number of the escrow creation tx'
  },
  password: {
    type: 'string',
    required: true,
    description: 'password required to release the escrow'
  },
  memo: {
    type: 'string',
    required: false,
    description: 'memo to include in the transaction'
  }

}

export async function handler ({ owner, sequence, password, memo }: Params) {

  const { address, secret } = await getXrpAddressAndSecret()

  console.log(`Creating condition and fulfillment from password: ${password}`)
  const crypoCondition = preimageSha256(password)
  const condition = crypoCondition.condition.toString('hex').toUpperCase()
  const fulfillment = crypoCondition.fulfillment.toString('hex').toUpperCase()
  console.log(`Crypto-condition: ${condition}`)
  console.log(`Crypto-condition (fulfillment): ${fulfillment}`)

  const memos = (memo) ? [{
    type: 'text/html',
    data: Buffer.from(memo, 'utf8').toString('hex')
  }] : []

  const prepared = await (await api()).prepareEscrowExecution(address, {
    owner,
    escrowSequence: sequence,
    condition,
    fulfillment,
    memos
  })
  console.log('Escrow release prepared...')

  const result = await signSubmitVerify(prepared, secret)

  console.log(JSON.stringify(result, null, 2))
  if (result.outcome.result === 'tesSUCCESS') {
    process.exit(0)
  }
  process.exit(1)
}
