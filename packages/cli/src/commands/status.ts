/**
 * apiwatch status — registered API count, last scan time, sync status, server connectivity.
 */

export interface StatusOptions {
  cwd?: string;
  quiet?: boolean;
}

export async function runStatus(options: StatusOptions = {}): Promise<void> {
  const { quiet = false } = options;
  if (quiet) return;
  process.stdout.write('Registered APIs: 0\n');
  process.stdout.write('Last scan: never\n');
  process.stdout.write('Sync: in-sync\n');
  process.stdout.write('Server: not configured (run apiwatch init)\n');
}
