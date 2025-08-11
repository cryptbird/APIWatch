/**
 * Classify SchemaDiff -> ThreatLevel. computeRiskScore(diff, graph) 0-100.
 */

import type { SchemaDiff, SchemaChange, ChangeType } from '@apiwatch/shared';
import type { ThreatLevel } from '@apiwatch/shared';

const CRITICAL_TYPES: ChangeType[] = [
  'PARAM_REQUIRED_ADDED',
  'PARAM_REMOVED',
  'PARAM_TYPE_CHANGED',
  'ENDPOINT_REMOVED',
  'METHOD_CHANGED',
  'PATH_CHANGED',
  'AUTH_SCHEME_CHANGED',
];
const NEUTRAL_TYPES: ChangeType[] = ['PARAM_OPTIONAL_ADDED', 'RESPONSE_SCHEMA_EXTENDED', 'RATE_LIMIT_CHANGED', 'DEPRECATION_ADDED'];
const LOW_TYPES: ChangeType[] = ['DESCRIPTION_CHANGED', 'EXAMPLE_CHANGED'];

export interface ThreatRuleOverride {
  changeType: ChangeType;
  threatLevel: ThreatLevel;
}

export interface ClassifyOptions {
  overrides?: ThreatRuleOverride[];
}

/**
 * Classify diff to LOW | NEUTRAL | CRITICAL. Overrides applied after default.
 */
export function classify(diff: SchemaDiff, options: ClassifyOptions = {}): ThreatLevel {
  for (const c of diff.changes) {
    const override = options.overrides?.find((o) => o.changeType === c.type);
    if (override) return override.threatLevel;
    if (CRITICAL_TYPES.includes(c.type)) return 'CRITICAL';
  }
  for (const c of diff.changes) {
    const override = options.overrides?.find((o) => o.changeType === c.type);
    if (override) return override.threatLevel;
    if (NEUTRAL_TYPES.includes(c.type)) return 'NEUTRAL';
  }
  for (const c of diff.changes) {
    if (LOW_TYPES.includes(c.type)) return 'LOW';
  }
  return 'LOW';
}

export interface RiskContext {
  dependentCount?: number;
  centralityScore?: number;
  crossTeam?: boolean;
}

/**
 * Risk score 0-100: base + dependentCount*2 (cap 30) + centralityScore*20 + crossTeam*10.
 */
export function computeRiskScore(diff: SchemaDiff, context: RiskContext = {}): number {
  const level = classify(diff);
  let base = level === 'CRITICAL' ? 40 : level === 'NEUTRAL' ? 20 : 5;
  let score = base;
  const dep = Math.min(context.dependentCount ?? 0, 15);
  score += dep * 2;
  score += Math.min((context.centralityScore ?? 0) * 20, 30);
  if (context.crossTeam) score += 10;
  return Math.min(100, Math.round(score));
}
