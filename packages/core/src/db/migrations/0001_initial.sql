-- APIWatch initial schema: repos, apis, api_params
CREATE TABLE IF NOT EXISTS repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  team_id VARCHAR(255) NOT NULL,
  org_id VARCHAR(255) NOT NULL,
  framework VARCHAR(50) NOT NULL,
  api_key_hash VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS apis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  path VARCHAR(1024) NOT NULL,
  method VARCHAR(16) NOT NULL,
  request_body JSONB,
  responses JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  deprecated BOOLEAN DEFAULT FALSE,
  team_id VARCHAR(255) NOT NULL,
  squad_id VARCHAR(255) NOT NULL,
  location_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS apis_repo_id_idx ON apis(repo_id);
CREATE INDEX IF NOT EXISTS apis_path_method_idx ON apis(path, method);

CREATE TABLE IF NOT EXISTS api_params (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  param_in VARCHAR(32) NOT NULL,
  required BOOLEAN NOT NULL,
  schema JSONB NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS api_params_api_id_idx ON api_params(api_id);
