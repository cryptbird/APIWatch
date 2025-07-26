/**
 * Dependency graph: adjacency list, addNode/addEdge/removeNode/removeEdge.
 * O(1) neighbor lookup via Map<string, Set<string>>.
 */

import type { GraphNode, GraphEdge, SerializedGraph } from '@apiwatch/shared';
import { findSCCs, sccsToCycles } from './algorithms/tarjan.js';
import { toSerializedGraph } from './graph.serializer.js';

export class DependencyGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private outNeighbors: Map<string, Set<string>> = new Map();
  private inNeighbors: Map<string, Set<string>> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.outNeighbors.has(node.id)) this.outNeighbors.set(node.id, new Set());
    if (!this.inNeighbors.has(node.id)) this.inNeighbors.set(node.id, new Set());
  }

  addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, { ...edge });
    const out = this.outNeighbors.get(edge.sourceApiId);
    if (out) out.add(edge.targetApiId);
    else this.outNeighbors.set(edge.sourceApiId, new Set([edge.targetApiId]));
    const inSet = this.inNeighbors.get(edge.targetApiId);
    if (inSet) inSet.add(edge.sourceApiId);
    else this.inNeighbors.set(edge.targetApiId, new Set([edge.sourceApiId]));
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    this.outNeighbors.delete(id);
    this.inNeighbors.delete(id);
    for (const [eid, e] of this.edges.entries()) {
      if (e.sourceApiId === id || e.targetApiId === id) this.edges.delete(eid);
    }
    for (const set of this.outNeighbors.values()) set.delete(id);
    for (const set of this.inNeighbors.values()) set.delete(id);
  }

  removeEdge(id: string): void {
    const edge = this.edges.get(id);
    if (edge) {
      this.outNeighbors.get(edge.sourceApiId)?.delete(edge.targetApiId);
      this.inNeighbors.get(edge.targetApiId)?.delete(edge.sourceApiId);
      this.edges.delete(id);
    }
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /** Immediate dependents (callers of this API) = in-neighbors. */
  getDependents(apiId: string): string[] {
    return Array.from(this.inNeighbors.get(apiId) ?? []);
  }

  /** Immediate dependencies (APIs this one calls) = out-neighbors. */
  getDependencies(apiId: string): string[] {
    return Array.from(this.outNeighbors.get(apiId) ?? []);
  }

  /** Find edge from source to target. */
  private getEdgeBetween(sourceId: string, targetId: string): GraphEdge | undefined {
    for (const e of this.edges.values()) {
      if (e.sourceApiId === sourceId && e.targetApiId === targetId) return e;
    }
    return undefined;
  }

  /** BFS: all upstream callers up to maxDepth. */
  getDependentsBfs(apiId: string, maxDepth: number = 3): Array<{ nodeId: string; depth: number; callCount: number; avgLatencyMs: number; errorRate: number }> {
    const visited = new Set<string>();
    const result: Array<{ nodeId: string; depth: number; callCount: number; avgLatencyMs: number; errorRate: number }> = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: apiId, depth: 0 }];
    visited.add(apiId);
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth >= maxDepth) continue;
      const inSet = this.inNeighbors.get(id) ?? new Set();
      for (const callerId of inSet) {
        if (visited.has(callerId)) continue;
        visited.add(callerId);
        const edge = this.getEdgeBetween(callerId, id);
        result.push({
          nodeId: callerId,
          depth: depth + 1,
          callCount: edge?.callCount ?? 0,
          avgLatencyMs: edge?.avgLatencyMs ?? 0,
          errorRate: edge?.errorRate ?? 0,
        });
        queue.push({ id: callerId, depth: depth + 1 });
      }
    }
    return result;
  }

  /** BFS: all downstream dependencies up to maxDepth. */
  getDependenciesBfs(apiId: string, maxDepth: number = 3): Array<{ nodeId: string; depth: number; callCount: number; avgLatencyMs: number; errorRate: number }> {
    const visited = new Set<string>();
    const result: Array<{ nodeId: string; depth: number; callCount: number; avgLatencyMs: number; errorRate: number }> = [];
    const queue: Array<{ id: string; depth: number }> = [{ id: apiId, depth: 0 }];
    visited.add(apiId);
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (depth >= maxDepth) continue;
      const outSet = this.outNeighbors.get(id) ?? new Set();
      for (const calleeId of outSet) {
        if (visited.has(calleeId)) continue;
        visited.add(calleeId);
        const edge = this.getEdgeBetween(id, calleeId);
        result.push({
          nodeId: calleeId,
          depth: depth + 1,
          callCount: edge?.callCount ?? 0,
          avgLatencyMs: edge?.avgLatencyMs ?? 0,
          errorRate: edge?.errorRate ?? 0,
        });
        queue.push({ id: calleeId, depth: depth + 1 });
      }
    }
    return result;
  }

  /** Complete upstream and downstream tree (no depth limit). */
  getFullChain(apiId: string): { upstream: string[]; downstream: string[] } {
    const visitedUp = new Set<string>();
    const queueUp = [apiId];
    visitedUp.add(apiId);
    while (queueUp.length > 0) {
      const id = queueUp.shift()!;
      for (const c of this.inNeighbors.get(id) ?? []) {
        if (!visitedUp.has(c)) {
          visitedUp.add(c);
          queueUp.push(c);
        }
      }
    }
    visitedUp.delete(apiId);
    const visitedDown = new Set<string>();
    const queueDown = [apiId];
    visitedDown.add(apiId);
    while (queueDown.length > 0) {
      const id = queueDown.shift()!;
      for (const c of this.outNeighbors.get(id) ?? []) {
        if (!visitedDown.has(c)) {
          visitedDown.add(c);
          queueDown.push(c);
        }
      }
    }
    visitedDown.delete(apiId);
    return {
      upstream: Array.from(visitedUp),
      downstream: Array.from(visitedDown),
    };
  }

  getNeighbors(apiId: string): string[] {
    const out = this.outNeighbors.get(apiId) ?? new Set();
    const inSet = this.inNeighbors.get(apiId) ?? new Set();
    return Array.from(new Set([...out, ...inSet]));
  }

  getSubgraph(apiIds: Set<string>): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes = this.getAllNodes().filter((n) => apiIds.has(n.id));
    const edges = this.getAllEdges().filter(
      (e) => apiIds.has(e.sourceApiId) && apiIds.has(e.targetApiId)
    );
    return { nodes, edges };
  }

  /** Run Tarjan SCC and return cycles (each cycle = array of node IDs). */
  detectCycles(): string[][] {
    const nodeIds = this.getAllNodes().map((n) => n.id);
    const getOut = (id: string) => Array.from(this.outNeighbors.get(id) ?? []);
    const sccs = findSCCs(nodeIds, getOut);
    const cycles = sccsToCycles(sccs, getOut);
    if (cycles.length > 0) {
      console.warn(`[DependencyGraph] ${cycles.length} cycle(s) detected`);
    }
    return cycles;
  }

  /** Serialize to JSON-friendly form for frontend. */
  serialize(): SerializedGraph {
    const nodes = this.getAllNodes();
    const edges = this.getAllEdges();
    const cycleCount = this.detectCycles().length;
    return toSerializedGraph(nodes, edges, cycleCount);
  }
}
