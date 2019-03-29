import { Argv } from 'yargs'

export const command = 'tx '
export const describe = `Find a tx on the XRP ledger`
export const builder = (argv: Argv) => {
  return argv.commandDir('tx')
}
