import { Options } from 'yargs'
import * as accountSet from './account-set-transaction';

export type Params = {
  emailHash: string
}
export const command = 'emailHash <emailHash>'
export const describe = `Sets an emailHash on the XRP ledger account to show the avatar.`
export const builder: { [key: string]: Options } = {
  emailHash: {
    type: 'string',
    required: true,
    description: 'emailHash to set on your XRPL account'
  }
}

export async function handler ({ emailHash }: Params) {

  let result = await accountSet.execute({emailHash: emailHash});

  console.log(JSON.stringify(result, null, 2))
  
  if (result.outcome.result === 'tesSUCCESS') {
    console.log('\nemailHash set to: ' + emailHash)
    process.exit(0)
  }
  process.exit(1)
}

