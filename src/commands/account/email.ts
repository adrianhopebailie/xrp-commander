import { Options } from 'yargs'
import { AccountSet } from './account-set-transaction';

export type Params = {
  emailHash?: string
}
export const command = 'email [email]'
export const describe = `Sets an email for the XRP ledger account to show the avatar. Leave empty to delete avatar.`
export const builder: { [key: string]: Options } = {
  emailHash: {
    type: 'string',
    required: false,
    description: 'emailHash to set on your XRPL account'
  }
}

export async function handler ({ emailHash }: Params) {

  let result = await AccountSet({emailHash: emailHash ? emailHash : ''});

  console.log(JSON.stringify(result, null, 2))
  
  if (result.outcome.result === 'tesSUCCESS') {
    console.log('emailHash set to: ' + emailHash)
    process.exit(0)
  }
  process.exit(1)
}

