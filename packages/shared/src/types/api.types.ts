/**
 * Shared API and endpoint type definitions for APIWatch.
 */

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  $ref?: string;
  description?: string;
  [key: string]: unknown;
}

export interface ApiParam {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  required: boolean;
  schema: JsonSchema;
  description?: string;
}

export interface ApiEndpoint {
  id: string;
  repoId: string;
  path: string;
  method: HttpMethod;
  params: ApiParam[];
  requestBody?: JsonSchema;
  responses: Record<string, JsonSchema>;
  tags: string[];
  deprecated: boolean;
  teamId: string;
  squadId: string;
  locationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ThreatLevel = 'LOW' | 'NEUTRAL' | 'CRITICAL';
