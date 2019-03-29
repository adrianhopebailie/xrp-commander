import { Argv } from 'yargs'

export const command = 'escrow '
export const describe = `Create/Cancel/Execute an escrow on the XRP ledger`
export const builder = (argv: Argv) => {
  return argv.commandDir('escrow')
}
