import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Normalization helper functions
function normalize(value, min, max) {
  if (max === min) return 1;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function calculateMaturityScore(framework, characteristics, allMetrics) {
  const metrics = characteristics.github_metrics || {};
  let score = 0;

  // GitHub stars (max 20 points)
  const maxStars = Math.max(...allMetrics.map(m => m.stars || 0));
  score += normalize(metrics.stars || 0, 0, maxStars) * 20;

  // Age of project (max 15 points)
  if (framework.first_release_date) {
    const ageInDays = Math.floor((new Date() - new Date(framework.first_release_date)) / (1000 * 60 * 60 * 24));
    score += normalize(ageInDays, 0, 1095) * 15; // 3 years = max
  }

  // Release recency (max 15 points)
  if (framework.latest_release_date) {
    const daysSinceRelease = Math.floor((new Date() - new Date(framework.latest_release_date)) / (1000 * 60 * 60 * 24));
    score += normalize(90 - daysSinceRelease, 0, 90) * 15; // Recent releases score higher
  }

  // Issue resolution (max 15 points)
  const openIssues = metrics.open_issues || 0;
  const closedIssues = metrics.closed_issues_30d || 0;
  if (openIssues + closedIssues > 0) {
    const resolutionRate = closedIssues / (openIssues + closedIssues);
    score += resolutionRate * 15;
  }

  // Documentation quality placeholder (max 10 points)
  score += 7; // Default moderate score

  // Community health placeholder (max 10 points)
  score += 7; // Default moderate score

  // Breaking changes frequency (max 15 points)
  score += 12; // Default good score

  return Math.min(100, Math.max(0, score));
}

function calculateCapabilityScore(characteristics) {
  let score = 0;
  let featureCount = 0;

  // Binary features (1 point each, max 40)
  const binaryFeatures = [
    'cli_support', 'docker_support', 'vscode_extension', 'custom_ui',
    'free_tier', 'paid_tier', 'open_source',
    'model_agnostic', 'openai_compatible', 'anthropic_compatible',
    'mcp_protocol_support', 'custom_tool_integration',
    'web_browsing', 'file_system_access', 'code_execution',
    'database_access', 'memory_persistence',
    'subagent_support', 'async_execution', 'parallel_tool_calls',
    'streaming_responses', 'automatic_summarization', 'rag_integration'
  ];

  binaryFeatures.forEach(feature => {
    if (characteristics[feature]) featureCount++;
  });

  score += Math.min(40, featureCount);

  // Integrated tools (estimate, max 20)
  score += 15; // Default

  // Supported models (max 10)
  score += 8; // Default

  // Workflow sophistication (max 10)
  score += 7; // Default

  // Role system design (max 10)
  score += 7; // Default

  // Tool integration architecture (max 10)
  score += 8; // Default

  return Math.min(100, Math.max(0, score));
}

function calculatePerformanceScore() {
  // Placeholder implementation
  return 70 + Math.random() * 20;
}

function calculateUsabilityScore(characteristics) {
  let score = 0;

  // Documentation quality (max 15)
  score += 10; // Default

  // Configuration flexibility (max 10)
  score += 7; // Default

  // Operating environment options (5 points each, max 20)
  if (characteristics.cli_support) score += 5;
  if (characteristics.docker_support) score += 5;
  if (characteristics.vscode_extension) score += 5;
  if (characteristics.custom_ui) score += 5;

  // Setup complexity (max 15)
  score += 10; // Default

  // Error handling quality (max 10)
  score += 7; // Default

  // Learning curve (max 10)
  score += 7; // Default

  // IDE integration (max 20)
  if (characteristics.vscode_extension || characteristics.custom_ui) {
    score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateReliabilityScore() {
  // Placeholder implementation
  return 65 + Math.random() * 25;
}

function calculateInnovationScore(framework, characteristics) {
  let score = 0;

  // Unique features (estimate, max 30)
  score += 15; // Default

  // Novel architecture (max 20)
  if (characteristics.subagent_support) score += 5;
  if (characteristics.mcp_protocol_support) score += 5;
  if (characteristics.async_execution) score += 5;

  // Contribution to ecosystem (max 15)
  score += 10; // Default

  // Research citations (max 15)
  score += 5; // Default

  // Feature velocity (max 20)
  if (framework.latest_release_date) {
    const daysSinceRelease = Math.floor((new Date() - new Date(framework.latest_release_date)) / (1000 * 60 * 60 * 24));
    if (daysSinceRelease < 30) score += 15;
    else if (daysSinceRelease < 90) score += 10;
    else score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export async function calculateScores() {
  const client = await pool.connect();

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all frameworks with latest characteristics
    const result = await client.query(`
      SELECT
        f.*,
        ch.*,
        ch.id as char_id,
        f.id as framework_id
      FROM frameworks f
      LEFT JOIN LATERAL (
        SELECT * FROM characteristics
        WHERE framework_id = f.id
        ORDER BY collection_date DESC
        LIMIT 1
      ) ch ON true
      WHERE f.is_active = true
    `);

    // Collect all metrics for normalization
    const allMetrics = result.rows.map(row => row.github_metrics || {});

    for (const row of result.rows) {
      const framework = {
        id: row.framework_id,
        name: row.name,
        slug: row.slug,
        first_release_date: row.first_release_date,
        latest_release_date: row.latest_release_date
      };

      const characteristics = {
        github_metrics: row.github_metrics || {},
        cli_support: row.cli_support,
        docker_support: row.docker_support,
        vscode_extension: row.vscode_extension,
        custom_ui: row.custom_ui,
        open_source: row.open_source,
        free_tier: row.free_tier,
        paid_tier: row.paid_tier,
        model_agnostic: row.model_agnostic,
        openai_compatible: row.openai_compatible,
        anthropic_compatible: row.anthropic_compatible,
        mcp_protocol_support: row.mcp_protocol_support,
        custom_tool_integration: row.custom_tool_integration,
        web_browsing: row.web_browsing,
        file_system_access: row.file_system_access,
        code_execution: row.code_execution,
        database_access: row.database_access,
        memory_persistence: row.memory_persistence,
        subagent_support: row.subagent_support,
        async_execution: row.async_execution,
        parallel_tool_calls: row.parallel_tool_calls,
        streaming_responses: row.streaming_responses,
        automatic_summarization: row.automatic_summarization,
        rag_integration: row.rag_integration
      };

      console.log(`  🔢 ${framework.name}...`);

      // Calculate component scores
      const maturityScore = calculateMaturityScore(framework, characteristics, allMetrics);
      const capabilityScore = calculateCapabilityScore(characteristics);
      const performanceScore = calculatePerformanceScore();
      const usabilityScore = calculateUsabilityScore(characteristics);
      const reliabilityScore = calculateReliabilityScore();
      const innovationScore = calculateInnovationScore(framework, characteristics);

      // Calculate overall scores with different weightings
      const developerScore =
        capabilityScore * 0.30 +
        performanceScore * 0.25 +
        usabilityScore * 0.25 +
        innovationScore * 0.15 +
        reliabilityScore * 0.05;

      const enterpriseScore =
        reliabilityScore * 0.35 +
        maturityScore * 0.30 +
        performanceScore * 0.20 +
        capabilityScore * 0.10 +
        usabilityScore * 0.05;

      const researcherScore =
        innovationScore * 0.35 +
        capabilityScore * 0.30 +
        performanceScore * 0.20 +
        maturityScore * 0.10 +
        usabilityScore * 0.05;

      // Insert or update scores
      await client.query(`
        INSERT INTO scores (
          framework_id, collection_date, methodology_version,
          maturity_score, capability_score, performance_score,
          usability_score, reliability_score, innovation_score,
          developer_score, enterprise_score, researcher_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (framework_id, collection_date)
        DO UPDATE SET
          maturity_score = $4,
          capability_score = $5,
          performance_score = $6,
          usability_score = $7,
          reliability_score = $8,
          innovation_score = $9,
          developer_score = $10,
          enterprise_score = $11,
          researcher_score = $12,
          created_at = NOW()
      `, [
        framework.id,
        today,
        '1.0.0',
        maturityScore.toFixed(2),
        capabilityScore.toFixed(2),
        performanceScore.toFixed(2),
        usabilityScore.toFixed(2),
        reliabilityScore.toFixed(2),
        innovationScore.toFixed(2),
        developerScore.toFixed(2),
        enterpriseScore.toFixed(2),
        researcherScore.toFixed(2)
      ]);

      console.log(`    ✓ Developer: ${developerScore.toFixed(1)}, Enterprise: ${enterpriseScore.toFixed(1)}, Researcher: ${researcherScore.toFixed(1)}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Run standalone if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  calculateScores()
    .then(() => {
      console.log('✅ Score calculation complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
