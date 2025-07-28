/**
 * Graph service: loads graph from DB, keeps in memory, exposes graph operations.
 * Singleton with lazy initialization.
 */

import type { GraphNode, GraphEdge } from '@apiwatch/shared';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { apis, dependencyEdges } from '../db/schema.js';
import type { Env } from '../env.js';
import { DependencyGraph } from './DependencyGraph.js';

let instance: GraphService | null = null;

export class GraphService {
  private graph: DependencyGraph = new DependencyGraph();
  private loaded = false;

  constructor(private _env: Env) {}

  static getInstance(env: Env): GraphService {
    if (instance === null) {
      instance = new GraphService(env);
    }
    return instance;
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    const pool = createDbPool(this._env.DATABASE_URL);
    const db = createDrizzle(pool);
    const apiRows = await db.select().from(apis);
    const edgeRows = await db.select().from(dependencyEdges);
    for (const row of apiRows) {
      const node: GraphNode = {
        id: row.id,
        repoId: row.repoId,
        teamId: row.teamId,
        squadId: row.squadId,
        locationId: row.locationId,
        label: `${row.method} ${row.path}`,
        inDegree: 0,
        outDegree: 0,
        centralityScore: 0,
        threatLevel: 'LOW',
      };
      this.graph.addNode(node);
    }
    for (const row of edgeRows) {
      const edge: GraphEdge = {
        id: row.id,
        sourceApiId: row.sourceApiId,
        targetApiId: row.targetApiId,
        callCount: row.callCount ?? 0,
        lastCalledAt: row.lastCalledAt ?? new Date(),
        avgLatencyMs: row.avgLatencyMs ?? 0,
        errorRate: (row.callCount ?? 0) > 0 ? (row.errorCount ?? 0) / (row.callCount ?? 1) : 0,
      };
      this.graph.addEdge(edge);
    }
    this.graph.computeCentrality();
    this.loaded = true;
  }

  getGraph(): DependencyGraph {
    return this.graph;
  }

  async getDependents(apiId: string, maxDepth = 3): ReturnType<DependencyGraph['getDependentsBfs']> {
    await this.load();
    return this.graph.getDependentsBfs(apiId, maxDepth);
  }

  async getDependencies(apiId: string, maxDepth = 3): ReturnType<DependencyGraph['getDependenciesBfs']> {
    await this.load();
    return this.graph.getDependenciesBfs(apiId, maxDepth);
  }

  async getCriticalPath(): Promise<string[]> {
    await this.load();
    return this.graph.getCriticalPath();
  }

  async getFullChain(apiId: string): ReturnType<DependencyGraph['getFullChain']> {
    await this.load();
    return this.graph.getFullChain(apiId);
  }

  async serialize(): ReturnType<DependencyGraph['serialize']> {
    await this.load();
    return this.graph.serialize();
  }

  async getStats(): Promise<{ nodeCount: number; edgeCount: number; cycleCount: number }> {
    await this.load();
    const nodes = this.graph.getAllNodes();
    const edges = this.graph.getAllEdges();
    const cycleCount = this.graph.detectCycles().length;
    return { nodeCount: nodes.length, edgeCount: edges.length, cycleCount };
  }
}
