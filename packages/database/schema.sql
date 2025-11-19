-- Agentic Framework Benchmark System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Frameworks table: Core framework information
CREATE TABLE IF NOT EXISTS frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  repository_url VARCHAR(512) NOT NULL,
  documentation_url VARCHAR(512),
  website_url VARCHAR(512),
  logo_url VARCHAR(512),
  license VARCHAR(50),
  first_release_date DATE,
  latest_release_date DATE,
  current_version VARCHAR(50),
  primary_language VARCHAR(50),
  primary_maintainer VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_frameworks_slug ON frameworks(slug);
CREATE INDEX idx_frameworks_active ON frameworks(is_active);
CREATE INDEX idx_frameworks_updated ON frameworks(updated_at DESC);

-- Scores table: Time-series scoring data
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  methodology_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',

  -- Component Scores (0-100)
  maturity_score NUMERIC(5,2) DEFAULT 0,
  capability_score NUMERIC(5,2) DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  usability_score NUMERIC(5,2) DEFAULT 0,
  reliability_score NUMERIC(5,2) DEFAULT 0,
  innovation_score NUMERIC(5,2) DEFAULT 0,

  -- Overall Scores (0-100)
  developer_score NUMERIC(5,2) DEFAULT 0,
  enterprise_score NUMERIC(5,2) DEFAULT 0,
  researcher_score NUMERIC(5,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(framework_id, collection_date)
);

CREATE INDEX idx_scores_framework ON scores(framework_id);
CREATE INDEX idx_scores_date ON scores(collection_date DESC);
CREATE INDEX idx_scores_developer ON scores(developer_score DESC);

-- Characteristics table: Binary and quantitative framework characteristics
CREATE TABLE IF NOT EXISTS characteristics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,

  -- Operating Environment (binary)
  cli_support BOOLEAN DEFAULT false,
  docker_support BOOLEAN DEFAULT false,
  vscode_extension BOOLEAN DEFAULT false,
  custom_ui BOOLEAN DEFAULT false,

  -- Licensing (binary)
  free_tier BOOLEAN DEFAULT false,
  paid_tier BOOLEAN DEFAULT false,
  open_source BOOLEAN DEFAULT false,

  -- Model Support (binary)
  model_agnostic BOOLEAN DEFAULT false,
  predefined_models_only BOOLEAN DEFAULT false,
  openai_compatible BOOLEAN DEFAULT false,
  anthropic_compatible BOOLEAN DEFAULT false,

  -- MCP Support (binary)
  mcp_protocol_support BOOLEAN DEFAULT false,
  custom_tool_integration BOOLEAN DEFAULT false,

  -- Integrated Tools (binary)
  web_browsing BOOLEAN DEFAULT false,
  file_system_access BOOLEAN DEFAULT false,
  code_execution BOOLEAN DEFAULT false,
  database_access BOOLEAN DEFAULT false,
  memory_persistence BOOLEAN DEFAULT false,
  image_generation BOOLEAN DEFAULT false,
  image_analysis BOOLEAN DEFAULT false,
  pdf_processing BOOLEAN DEFAULT false,
  web_scraping BOOLEAN DEFAULT false,

  -- Architecture (binary)
  subagent_support BOOLEAN DEFAULT false,
  async_execution BOOLEAN DEFAULT false,
  parallel_tool_calls BOOLEAN DEFAULT false,
  streaming_responses BOOLEAN DEFAULT false,

  -- Context Management (binary)
  automatic_summarization BOOLEAN DEFAULT false,
  semantic_compression BOOLEAN DEFAULT false,
  manual_context_control BOOLEAN DEFAULT false,
  rag_integration BOOLEAN DEFAULT false,

  -- Quantitative Metrics (JSONB for flexibility)
  github_metrics JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  context_metrics JSONB DEFAULT '{}'::jsonb,

  -- Qualitative Scores (JSONB with details)
  qualitative_scores JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(framework_id, collection_date)
);

CREATE INDEX idx_characteristics_framework ON characteristics(framework_id);
CREATE INDEX idx_characteristics_date ON characteristics(collection_date DESC);

-- Configuration Files table: Tracked configuration files
CREATE TABLE IF NOT EXISTS config_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  commit_hash VARCHAR(40),
  collection_date DATE NOT NULL,
  storage_url VARCHAR(512),
  file_size_bytes INTEGER,
  content TEXT,
  parsed_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_framework ON config_files(framework_id);
CREATE INDEX idx_config_type ON config_files(file_type);
CREATE INDEX idx_config_date ON config_files(collection_date DESC);

-- Benchmark Results table: Performance benchmark data
CREATE TABLE IF NOT EXISTS benchmark_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  benchmark_date DATE NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  task_category VARCHAR(100) NOT NULL,

  success BOOLEAN NOT NULL DEFAULT false,
  quality_score NUMERIC(4,2),
  execution_time_seconds NUMERIC(8,2),
  api_calls_made INTEGER,
  tokens_used INTEGER,
  error_message TEXT,
  model_used VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_benchmark_framework ON benchmark_results(framework_id);
CREATE INDEX idx_benchmark_date ON benchmark_results(benchmark_date DESC);
CREATE INDEX idx_benchmark_task ON benchmark_results(task_name);

-- Usage Statistics table: Real-world usage metrics
CREATE TABLE IF NOT EXISTS usage_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  model_name VARCHAR(255),
  weekly_tokens BIGINT,
  market_share_percent NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(framework_id, collection_date, data_source, model_name)
);

CREATE INDEX idx_usage_framework ON usage_statistics(framework_id);
CREATE INDEX idx_usage_date ON usage_statistics(collection_date DESC);
CREATE INDEX idx_usage_source ON usage_statistics(data_source);

-- Methodology Proposals table: Track proposed enhancements
CREATE TABLE IF NOT EXISTS methodology_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  implementation_complexity VARCHAR(20),
  expected_value_score INTEGER,
  affected_frameworks_count INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255)
);

CREATE INDEX idx_proposals_status ON methodology_proposals(status);
CREATE INDEX idx_proposals_created ON methodology_proposals(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to frameworks table
CREATE TRIGGER update_frameworks_updated_at
  BEFORE UPDATE ON frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
