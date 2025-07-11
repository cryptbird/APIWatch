#!/usr/bin/env node
/**
 * APIWatch CLI entry point.
 */

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runScan } from './commands/scan.js';
import { runStatus } from './commands/status.js';

const program = new Command();
program.name('apiwatch').version('1.0.0');

program
  .command('init')
  .description('First-time setup: generate apiwatch.config.ts')
  .action(() => runInit().catch((err) => { process.exitCode = 1; throw err; }));

program
  .command('scan')
  .description('Discover and optionally sync APIs')
  .option('--dry-run', 'Show results without syncing')
  .option('--verbose', 'Show all routes')
  .option('--yes', 'Skip confirmation')
  .action((opts) => runScan(opts).catch((err) => { process.exitCode = 1; throw err; }));

program
  .command('status')
  .description('Show registered APIs and sync status')
  .option('--quiet', 'No output')
  .action((opts) => runStatus(opts).catch((err) => { process.exitCode = 1; throw err; }));

program.parse();
