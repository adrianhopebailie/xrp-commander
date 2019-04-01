import { Argv } from 'yargs'

export const command = 'account '
export const describe = `Set a Domain and/or Avatar on your XRP ledger account`
export const builder = (argv: Argv) => {
  return argv.commandDir('account')
}
