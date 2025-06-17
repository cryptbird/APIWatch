/**
 * Shared schema diff and change types for APIWatch.
 */

export type ChangeType =
  | 'PARAM_REQUIRED_ADDED'
  | 'PARAM_REMOVED'
  | 'PARAM_TYPE_CHANGED'
  | 'ENDPOINT_REMOVED'
  | 'METHOD_CHANGED'
  | 'PATH_CHANGED'
  | 'PARAM_OPTIONAL_ADDED'
  | 'RESPONSE_SCHEMA_EXTENDED'
  | 'RATE_LIMIT_CHANGED'
  | 'AUTH_SCHEME_CHANGED'
  | 'DESCRIPTION_CHANGED'
  | 'DEPRECATION_ADDED';

export interface SchemaChange {
  type: ChangeType;
  path: string;
  before: unknown;
  after: unknown;
  description: string;
}

export interface SchemaDiff {
  apiEndpointId: string;
  fromVersion: number;
  toVersion: number;
  changes: SchemaChange[];
  breakingChanges: SchemaChange[];
  nonBreakingChanges: SchemaChange[];
  timestamp: Date;
}
