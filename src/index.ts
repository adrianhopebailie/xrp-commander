#!/usr/bin/env node

import * as yargs from 'yargs'
const argv = yargs
  .commandDir('commands')
  .demandCommand(1)
  .argv
