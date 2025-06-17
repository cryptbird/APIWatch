/**
 * Drizzle ORM schema for APIWatch core database.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const repos = pgTable('repos', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  teamId: varchar('team_id', { length: 255 }).notNull(),
  orgId: varchar('org_id', { length: 255 }).notNull(),
  framework: varchar('framework', { length: 50 }).notNull(),
  apiKeyHash: varchar('api_key_hash', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apis = pgTable(
  'apis',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: uuid('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    path: varchar('path', { length: 1024 }).notNull(),
    method: varchar('method', { length: 16 }).notNull(),
    requestBody: jsonb('request_body'),
    responses: jsonb('responses').default({}),
    tags: jsonb('tags').$type<string[]>().default([]),
    deprecated: boolean('deprecated').default(false),
    teamId: varchar('team_id', { length: 255 }).notNull(),
    squadId: varchar('squad_id', { length: 255 }).notNull(),
    locationId: varchar('location_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('apis_repo_id_idx').on(t.repoId), index('apis_path_method_idx').on(t.path, t.method)]
);

export const apiParams = pgTable(
  'api_params',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiId: uuid('api_id')
      .notNull()
      .references(() => apis.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    paramIn: varchar('param_in', { length: 32 }).notNull(),
    required: boolean('required').notNull(),
    schema: jsonb('schema').notNull(),
    description: text('description'),
  },
  (t) => [index('api_params_api_id_idx').on(t.apiId)]
);

export const dependencyEdges = pgTable(
  'dependency_edges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceApiId: uuid('source_api_id')
      .notNull()
      .references(() => apis.id, { onDelete: 'cascade' }),
    targetApiId: uuid('target_api_id')
      .notNull()
      .references(() => apis.id, { onDelete: 'cascade' }),
    sourceRepoId: uuid('source_repo_id').notNull(),
    targetRepoId: uuid('target_repo_id').notNull(),
    callCount: integer('call_count').default(0),
    lastCalledAt: timestamp('last_called_at'),
    avgLatencyMs: integer('avg_latency_ms'),
    errorCount: integer('error_count').default(0),
    firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
  },
  (t) => [
    index('dependency_edges_source_target_idx').on(t.sourceApiId, t.targetApiId),
    index('dependency_edges_source_idx').on(t.sourceApiId),
    index('dependency_edges_target_idx').on(t.targetApiId),
  ]
);

export const apiSnapshots = pgTable(
  'api_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiEndpointId: uuid('api_endpoint_id')
      .notNull()
      .references(() => apis.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    schema: jsonb('schema').notNull(),
    capturedAt: timestamp('captured_at').defaultNow().notNull(),
    capturedBy: varchar('captured_by', { length: 255 }).notNull(),
  },
  (t) => [index('api_snapshots_api_id_idx').on(t.apiEndpointId)]
);

export const changeEvents = pgTable(
  'change_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apiEndpointId: uuid('api_endpoint_id')
      .notNull()
      .references(() => apis.id, { onDelete: 'cascade' }),
    fromVersion: integer('from_version').notNull(),
    toVersion: integer('to_version').notNull(),
    diffPayload: jsonb('diff_payload').notNull(),
    threatLevel: varchar('threat_level', { length: 32 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('change_events_api_id_idx').on(t.apiEndpointId)]
);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  changeEventId: uuid('change_event_id').notNull(),
  subscriberId: varchar('subscriber_id', { length: 255 }).notNull(),
  channel: varchar('channel', { length: 32 }).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  acknowledgedAt: timestamp('acknowledged_at'),
  payload: jsonb('payload').default({}),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  orgId: varchar('org_id', { length: 255 }).notNull(),
  slackChannelId: varchar('slack_channel_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscribers = pgTable('subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  slackUserId: varchar('slack_user_id', { length: 255 }),
  preferredChannels: jsonb('preferred_channels').$type<string[]>().default([]),
  quietHoursStart: varchar('quiet_hours_start', { length: 8 }),
  quietHoursEnd: varchar('quiet_hours_end', { length: 8 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceApiId: uuid('source_api_id').notNull(),
    targetApiId: uuid('target_api_id'),
    targetUrl: varchar('target_url', { length: 2048 }).notNull(),
    method: varchar('method', { length: 16 }).notNull(),
    statusCode: integer('status_code'),
    latencyMs: integer('latency_ms'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (t) => [
    index('usage_events_source_idx').on(t.sourceApiId),
    index('usage_events_timestamp_idx').on(t.timestamp),
  ]
);
