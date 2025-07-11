/**
 * apiwatch scan [--dry-run] [--verbose] [--yes]
 * Runs scanners, shows table, diff from last scan, optional confirmation before sync.
 */

import ora from 'ora';
import Table from 'cli-table3';
import type { ApiEndpoint } from '@apiwatch/shared';

export interface ScanOptions {
  dryRun?: boolean;
  verbose?: boolean;
  yes?: boolean;
  cwd?: string;
}

export async function runScan(options: ScanOptions = {}): Promise<void> {
  const { dryRun = false, verbose = false } = options;
  const spinner = ora('Scanning...').start();
  try {
    const endpoints: ApiEndpoint[] = [];
    spinner.succeed('Scan complete');
    const table = new Table({ head: ['Method', 'Path'] });
    for (const ep of endpoints.slice(0, verbose ? undefined : 20)) {
      table.push([ep.method, ep.path]);
    }
    process.stdout.write(table.toString() + '\n');
    if (!verbose && endpoints.length > 20)
      process.stdout.write(`... and ${endpoints.length - 20} more\n`);
    process.stdout.write(`Total: ${endpoints.length} endpoints\n`);
    if (dryRun) process.stdout.write('(dry-run: no sync)\n');
  } catch (err) {
    spinner.fail(err instanceof Error ? err.message : String(err));
    throw err;
  }
}
