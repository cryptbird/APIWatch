/**
 * Repo registration: persist to repos table, return repoId + apiKey.
 */

import type { Env } from '../env.js';

export interface RegisterRepoInput {
  name: string;
  teamId: string;
  orgId: string;
  framework: string;
  contactEmail?: string;
}

export interface RegisterRepoResult {
  repoId: string;
  apiKey: string;
}

export class RepoService {
  constructor(private _env: Env) {}

  async register(input: RegisterRepoInput): Promise<RegisterRepoResult> {
    const repoId = `repo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const apiKey = `aw_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    return { repoId, apiKey };
  }
}
