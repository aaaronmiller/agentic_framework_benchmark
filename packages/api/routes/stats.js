import { Hono } from 'hono';
import { query } from '../db.js';

const app = new Hono();

// GET /api/v1/stats/summary - Get platform-wide statistics
app.get('/summary', async (c) => {
  try {
    // Count total frameworks
    const frameworksResult = await query(`
      SELECT COUNT(*) as count FROM frameworks WHERE is_active = true
    `);

    // Get average scores
    const scoresResult = await query(`
      SELECT
        AVG(developer_score) as avg_developer,
        AVG(enterprise_score) as avg_enterprise,
        AVG(researcher_score) as avg_researcher,
        AVG(maturity_score) as avg_maturity,
        AVG(capability_score) as avg_capability,
        AVG(performance_score) as avg_performance,
        AVG(usability_score) as avg_usability,
        AVG(reliability_score) as avg_reliability,
        AVG(innovation_score) as avg_innovation
      FROM scores
      WHERE collection_date = (SELECT MAX(collection_date) FROM scores)
    `);

    // Get top frameworks by developer score
    const topFrameworksResult = await query(`
      SELECT
        f.name,
        f.slug,
        s.developer_score
      FROM frameworks f
      JOIN scores s ON s.framework_id = f.id
      WHERE s.collection_date = (SELECT MAX(collection_date) FROM scores)
        AND f.is_active = true
      ORDER BY s.developer_score DESC
      LIMIT 5
    `);

    // Get characteristics distribution
    const characteristicsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE cli_support = true) as cli_count,
        COUNT(*) FILTER (WHERE docker_support = true) as docker_count,
        COUNT(*) FILTER (WHERE open_source = true) as open_source_count,
        COUNT(*) FILTER (WHERE mcp_protocol_support = true) as mcp_count,
        COUNT(*) FILTER (WHERE code_execution = true) as code_execution_count,
        COUNT(*) FILTER (WHERE file_system_access = true) as file_access_count
      FROM characteristics
      WHERE collection_date = (SELECT MAX(collection_date) FROM characteristics)
    `);

    const totalFrameworks = parseInt(frameworksResult.rows[0].count);
    const scores = scoresResult.rows[0];
    const topFrameworks = topFrameworksResult.rows;
    const charDist = characteristicsResult.rows[0];

    return c.json({
      data: {
        total_frameworks: totalFrameworks,
        average_scores: {
          developer: parseFloat(scores.avg_developer || 0).toFixed(2),
          enterprise: parseFloat(scores.avg_enterprise || 0).toFixed(2),
          researcher: parseFloat(scores.avg_researcher || 0).toFixed(2),
          components: {
            maturity: parseFloat(scores.avg_maturity || 0).toFixed(2),
            capability: parseFloat(scores.avg_capability || 0).toFixed(2),
            performance: parseFloat(scores.avg_performance || 0).toFixed(2),
            usability: parseFloat(scores.avg_usability || 0).toFixed(2),
            reliability: parseFloat(scores.avg_reliability || 0).toFixed(2),
            innovation: parseFloat(scores.avg_innovation || 0).toFixed(2)
          }
        },
        top_frameworks: topFrameworks.map(f => ({
          name: f.name,
          slug: f.slug,
          score: parseFloat(f.developer_score)
        })),
        characteristics_distribution: {
          cli_support: {
            count: parseInt(charDist.cli_count || 0),
            percentage: ((parseInt(charDist.cli_count || 0) / totalFrameworks) * 100).toFixed(1)
          },
          docker_support: {
            count: parseInt(charDist.docker_count || 0),
            percentage: ((parseInt(charDist.docker_count || 0) / totalFrameworks) * 100).toFixed(1)
          },
          open_source: {
            count: parseInt(charDist.open_source_count || 0),
            percentage: ((parseInt(charDist.open_source_count || 0) / totalFrameworks) * 100).toFixed(1)
          },
          mcp_protocol_support: {
            count: parseInt(charDist.mcp_count || 0),
            percentage: ((parseInt(charDist.mcp_count || 0) / totalFrameworks) * 100).toFixed(1)
          },
          code_execution: {
            count: parseInt(charDist.code_execution_count || 0),
            percentage: ((parseInt(charDist.code_execution_count || 0) / totalFrameworks) * 100).toFixed(1)
          },
          file_system_access: {
            count: parseInt(charDist.file_access_count || 0),
            percentage: ((parseInt(charDist.file_access_count || 0) / totalFrameworks) * 100).toFixed(1)
          }
        },
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch statistics', message: error.message }, 500);
  }
});

export default app;
