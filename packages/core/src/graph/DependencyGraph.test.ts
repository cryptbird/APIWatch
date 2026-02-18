/**
 * Unit tests for DependencyGraph.
 */

import { describe, it, expect } from 'vitest';
import { DependencyGraph } from './DependencyGraph.js';
import type { GraphNode, GraphEdge } from '@apiwatch/shared';

function node(id: string): GraphNode {
  return {
    id,
    repoId: 'r1',
    teamId: 't1',
    squadId: 's1',
    locationId: 'loc1',
    label: id,
    inDegree: 0,
    outDegree: 0,
    centralityScore: 0,
    threatLevel: 'LOW',
  };
}

function edge(id: string, source: string, target: string): GraphEdge {
  return {
    id,
    sourceApiId: source,
    targetApiId: target,
    callCount: 1,
    lastCalledAt: new Date(),
    avgLatencyMs: 10,
    errorRate: 0,
  };
}

describe('DependencyGraph', () => {
  it('addNode and getNode', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    expect(g.getNode('a')).toBeDefined();
    expect(g.getNode('a')?.label).toBe('a');
  });

  it('addEdge and getEdge', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addEdge(edge('e1', 'a', 'b'));
    expect(g.getEdge('e1')).toBeDefined();
    expect(g.getEdge('e1')?.sourceApiId).toBe('a');
    expect(g.getEdge('e1')?.targetApiId).toBe('b');
  });

  it('removeNode removes edges', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.removeNode('a');
    expect(g.getNode('a')).toBeUndefined();
    expect(g.getEdge('e1')).toBeUndefined();
  });

  it('getDependents returns callers (in-neighbors)', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addNode(node('c'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.addEdge(edge('e2', 'c', 'b'));
    expect(g.getDependents('b')).toHaveLength(2);
    expect(g.getDependents('b')).toContain('a');
    expect(g.getDependents('b')).toContain('c');
  });

  it('getDependencies returns callees (out-neighbors)', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addEdge(edge('e1', 'a', 'b'));
    expect(g.getDependencies('a')).toEqual(['b']);
  });

  it('getNeighbors returns both in and out', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addNode(node('c'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.addEdge(edge('e2', 'c', 'b'));
    expect(g.getNeighbors('b').sort()).toEqual(['a', 'c']);
  });

  it('getSubgraph returns only nodes and edges in set', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addNode(node('c'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.addEdge(edge('e2', 'b', 'c'));
    const sub = g.getSubgraph(new Set(['a', 'b']));
    expect(sub.nodes).toHaveLength(2);
    expect(sub.edges).toHaveLength(1);
    expect(sub.edges[0]?.id).toBe('e1');
  });

  it('getDependentsBfs returns callers up to maxDepth', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addNode(node('c'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.addEdge(edge('e2', 'c', 'b'));
    const list = g.getDependentsBfs('b', 2);
    expect(list.map((x) => x.nodeId).sort()).toEqual(['a', 'c']);
  });

  it('getFullChain returns upstream and downstream', () => {
    const g = new DependencyGraph();
    g.addNode(node('a'));
    g.addNode(node('b'));
    g.addNode(node('c'));
    g.addEdge(edge('e1', 'a', 'b'));
    g.addEdge(edge('e2', 'b', 'c'));
    const chain = g.getFullChain('b');
    expect(chain.upstream).toContain('a');
    expect(chain.downstream).toContain('c');
  });
});
