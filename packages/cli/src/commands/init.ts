/**
 * apiwatch init — interactive setup: server URL, repo name, framework, scan paths, apiKey.
 * Generates apiwatch.config.ts, adds postinstall script, shows success summary.
 */

import inquirer from 'inquirer';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { APIWATCH_CONFIG_TEMPLATE } from '../templates/configTemplate.js';

export interface InitOptions {
  cwd?: string;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const answers = await inquirer.prompt([
    { type: 'input', name: 'serverUrl', message: 'APIWatch server URL:', default: 'https://apiwatch.example.com' },
    { type: 'input', name: 'repoName', message: 'Repo name (used as repoId):', default: 'my-repo' },
    { type: 'input', name: 'teamName', message: 'Team name:', default: 'default' },
    { type: 'list', name: 'framework', message: 'Framework:', choices: ['express', 'fastify', 'nest', 'auto'], default: 'auto' },
    { type: 'input', name: 'scanPaths', message: 'Scan paths (comma-separated):', default: 'src' },
    { type: 'input', name: 'apiKey', message: 'API key (from server or leave blank to set later):', default: '' },
  ]);
  const serverUrl = (answers.serverUrl as string).trim();
  const repoId = (answers.repoName as string).trim() || 'my-repo';
  const apiKey = (answers.apiKey as string).trim() || 'your-api-key';
  const framework = answers.framework as string;
  const paths = (answers.scanPaths as string).split(',').map((p) => p.trim()).filter(Boolean);
  const content = APIWATCH_CONFIG_TEMPLATE.replace('{{SERVER_URL}}', serverUrl)
    .replace('{{REPO_ID}}', repoId)
    .replace('{{API_KEY}}', apiKey)
    .replace('{{FRAMEWORK}}', framework)
    .replace("['src']", JSON.stringify(paths.length ? paths : ['src']));
  const configPath = join(cwd, 'apiwatch.config.ts');
  writeFileSync(configPath, content, 'utf-8');
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { scripts?: Record<string, string> };
    if (!pkg.scripts) pkg.scripts = {};
    if (!pkg.scripts.postinstall) pkg.scripts.postinstall = 'apiwatch status --quiet';
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
  }
  process.stdout.write(`\nCreated ${configPath}\nRun: npx apiwatch scan\n`);
}
