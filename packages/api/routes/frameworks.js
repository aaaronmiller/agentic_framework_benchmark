import { Hono } from 'hono';
import { query } from '../db.js';

const app = new Hono();

// GET /api/v1/frameworks - List all frameworks with optional filters
app.get('/', async (c) => {
  try {
    const { environment, license, model_support, min_score } = c.req.query();

    let sql = `
      SELECT
        f.*,
        s.developer_score,
        s.enterprise_score,
        s.researcher_score,
        s.maturity_score,
        s.capability_score,
        s.performance_score,
        s.usability_score,
        s.reliability_score,
        s.innovation_score,
        ch.cli_support,
        ch.docker_support,
        ch.vscode_extension,
        ch.open_source,
        ch.free_tier,
        ch.paid_tier,
        ch.model_agnostic,
        ch.openai_compatible,
        ch.anthropic_compatible,
        ch.mcp_protocol_support,
        ch.github_metrics
      FROM frameworks f
      LEFT JOIN LATERAL (
        SELECT * FROM scores
        WHERE framework_id = f.id
        ORDER BY collection_date DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN LATERAL (
        SELECT * FROM characteristics
        WHERE framework_id = f.id
        ORDER BY collection_date DESC
        LIMIT 1
      ) ch ON true
      WHERE f.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    // Apply filters
    if (environment === 'cli') {
      sql += ` AND ch.cli_support = true`;
    } else if (environment === 'docker') {
      sql += ` AND ch.docker_support = true`;
    } else if (environment === 'vscode') {
      sql += ` AND ch.vscode_extension = true`;
    }

    if (license === 'opensource') {
      sql += ` AND ch.open_source = true`;
    } else if (license === 'free') {
      sql += ` AND ch.free_tier = true`;
    }

    if (model_support === 'openai') {
      sql += ` AND ch.openai_compatible = true`;
    } else if (model_support === 'anthropic') {
      sql += ` AND ch.anthropic_compatible = true`;
    } else if (model_support === 'agnostic') {
      sql += ` AND ch.model_agnostic = true`;
    }

    if (min_score) {
      const score = parseFloat(min_score);
      paramCount++;
      sql += ` AND s.developer_score >= $${paramCount}`;
      params.push(score);
    }

    sql += ` ORDER BY s.developer_score DESC NULLS LAST, f.name ASC`;

    const result = await query(sql, params);

    // Transform the results
    const frameworks = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      repository_url: row.repository_url,
      documentation_url: row.documentation_url,
      website_url: row.website_url,
      logo_url: row.logo_url,
      license: row.license,
      first_release_date: row.first_release_date,
      latest_release_date: row.latest_release_date,
      current_version: row.current_version,
      primary_language: row.primary_language,
      primary_maintainer: row.primary_maintainer,
      scores: {
        developer: parseFloat(row.developer_score) || 0,
        enterprise: parseFloat(row.enterprise_score) || 0,
        researcher: parseFloat(row.researcher_score) || 0,
        maturity: parseFloat(row.maturity_score) || 0,
        capability: parseFloat(row.capability_score) || 0,
        performance: parseFloat(row.performance_score) || 0,
        usability: parseFloat(row.usability_score) || 0,
        reliability: parseFloat(row.reliability_score) || 0,
        innovation: parseFloat(row.innovation_score) || 0
      },
      characteristics: {
        cli_support: row.cli_support || false,
        docker_support: row.docker_support || false,
        vscode_extension: row.vscode_extension || false,
        open_source: row.open_source || false,
        free_tier: row.free_tier || false,
        paid_tier: row.paid_tier || false,
        model_agnostic: row.model_agnostic || false,
        openai_compatible: row.openai_compatible || false,
        anthropic_compatible: row.anthropic_compatible || false,
        mcp_protocol_support: row.mcp_protocol_support || false
      },
      github_metrics: row.github_metrics || {}
    }));

    return c.json({
      data: frameworks,
      count: frameworks.length,
      filters_applied: {
        environment,
        license,
        model_support,
        min_score
      }
    });
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return c.json({ error: 'Failed to fetch frameworks', message: error.message }, 500);
  }
});

// GET /api/v1/frameworks/:slug - Get single framework
app.get('/:slug', async (c) => {
  try {
    const { slug } = c.req.param();

    const result = await query(`
      SELECT * FROM frameworks
      WHERE slug = $1 AND is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Framework not found' }, 404);
    }

    const framework = result.rows[0];

    // Get latest scores
    const scoresResult = await query(`
      SELECT * FROM scores
      WHERE framework_id = $1
      ORDER BY collection_date DESC
      LIMIT 1
    `, [framework.id]);

    // Get latest characteristics
    const characteristicsResult = await query(`
      SELECT * FROM characteristics
      WHERE framework_id = $1
      ORDER BY collection_date DESC
      LIMIT 1
    `, [framework.id]);

    const scores = scoresResult.rows[0] || {};
    const characteristics = characteristicsResult.rows[0] || {};

    return c.json({
      data: {
        ...framework,
        scores: {
          developer: parseFloat(scores.developer_score) || 0,
          enterprise: parseFloat(scores.enterprise_score) || 0,
          researcher: parseFloat(scores.researcher_score) || 0,
          components: {
            maturity: parseFloat(scores.maturity_score) || 0,
            capability: parseFloat(scores.capability_score) || 0,
            performance: parseFloat(scores.performance_score) || 0,
            usability: parseFloat(scores.usability_score) || 0,
            reliability: parseFloat(scores.reliability_score) || 0,
            innovation: parseFloat(scores.innovation_score) || 0
          }
        },
        characteristics: {
          operating_environment: {
            cli_support: characteristics.cli_support || false,
            docker_support: characteristics.docker_support || false,
            vscode_extension: characteristics.vscode_extension || false,
            custom_ui: characteristics.custom_ui || false
          },
          licensing: {
            free_tier: characteristics.free_tier || false,
            paid_tier: characteristics.paid_tier || false,
            open_source: characteristics.open_source || false
          },
          model_support: {
            model_agnostic: characteristics.model_agnostic || false,
            predefined_models_only: characteristics.predefined_models_only || false,
            openai_compatible: characteristics.openai_compatible || false,
            anthropic_compatible: characteristics.anthropic_compatible || false
          },
          tools: {
            mcp_protocol_support: characteristics.mcp_protocol_support || false,
            custom_tool_integration: characteristics.custom_tool_integration || false,
            web_browsing: characteristics.web_browsing || false,
            file_system_access: characteristics.file_system_access || false,
            code_execution: characteristics.code_execution || false,
            database_access: characteristics.database_access || false,
            memory_persistence: characteristics.memory_persistence || false
          },
          architecture: {
            subagent_support: characteristics.subagent_support || false,
            async_execution: characteristics.async_execution || false,
            parallel_tool_calls: characteristics.parallel_tool_calls || false,
            streaming_responses: characteristics.streaming_responses || false
          },
          github_metrics: characteristics.github_metrics || {},
          qualitative_scores: characteristics.qualitative_scores || {}
        }
      }
    });
  } catch (error) {
    console.error('Error fetching framework:', error);
    return c.json({ error: 'Failed to fetch framework', message: error.message }, 500);
  }
});

// GET /api/v1/frameworks/compare - Compare multiple frameworks
app.get('/compare', async (c) => {
  try {
    const { ids } = c.req.query();

    if (!ids) {
      return c.json({ error: 'Missing ids parameter' }, 400);
    }

    const slugs = ids.split(',').map(s => s.trim()).filter(Boolean);

    if (slugs.length === 0 || slugs.length > 5) {
      return c.json({ error: 'Please provide 1-5 framework slugs' }, 400);
    }

    const placeholders = slugs.map((_, i) => `$${i + 1}`).join(',');

    const result = await query(`
      SELECT
        f.*,
        s.developer_score,
        s.enterprise_score,
        s.researcher_score,
        s.maturity_score,
        s.capability_score,
        s.performance_score,
        s.usability_score,
        s.reliability_score,
        s.innovation_score,
        ch.*
      FROM frameworks f
      LEFT JOIN LATERAL (
        SELECT * FROM scores
        WHERE framework_id = f.id
        ORDER BY collection_date DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN LATERAL (
        SELECT * FROM characteristics
        WHERE framework_id = f.id
        ORDER BY collection_date DESC
        LIMIT 1
      ) ch ON true
      WHERE f.slug IN (${placeholders})
        AND f.is_active = true
    `, slugs);

    const frameworks = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      repository_url: row.repository_url,
      scores: {
        developer: parseFloat(row.developer_score) || 0,
        enterprise: parseFloat(row.enterprise_score) || 0,
        researcher: parseFloat(row.researcher_score) || 0,
        maturity: parseFloat(row.maturity_score) || 0,
        capability: parseFloat(row.capability_score) || 0,
        performance: parseFloat(row.performance_score) || 0,
        usability: parseFloat(row.usability_score) || 0,
        reliability: parseFloat(row.reliability_score) || 0,
        innovation: parseFloat(row.innovation_score) || 0
      },
      characteristics: {
        cli_support: row.cli_support || false,
        docker_support: row.docker_support || false,
        vscode_extension: row.vscode_extension || false,
        open_source: row.open_source || false,
        model_agnostic: row.model_agnostic || false,
        openai_compatible: row.openai_compatible || false,
        anthropic_compatible: row.anthropic_compatible || false,
        mcp_protocol_support: row.mcp_protocol_support || false,
        code_execution: row.code_execution || false,
        file_system_access: row.file_system_access || false,
        web_browsing: row.web_browsing || false,
        github_metrics: row.github_metrics || {}
      }
    }));

    return c.json({
      data: frameworks,
      count: frameworks.length
    });
  } catch (error) {
    console.error('Error comparing frameworks:', error);
    return c.json({ error: 'Failed to compare frameworks', message: error.message }, 500);
  }
});

export default app;
