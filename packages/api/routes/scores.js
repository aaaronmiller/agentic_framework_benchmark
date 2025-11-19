import { Hono } from 'hono';
import { query } from '../db.js';

const app = new Hono();

// GET /api/v1/scores/:slug/history - Get score history for a framework
app.get('/:slug/history', async (c) => {
  try {
    const { slug } = c.req.param();
    const { days = '90' } = c.req.query();

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return c.json({ error: 'days must be between 1 and 365' }, 400);
    }

    const result = await query(`
      SELECT
        s.*,
        f.name,
        f.slug
      FROM scores s
      JOIN frameworks f ON f.id = s.framework_id
      WHERE f.slug = $1
        AND s.collection_date >= NOW() - INTERVAL '1 day' * $2
      ORDER BY s.collection_date ASC
    `, [slug, daysNum]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Framework not found or no score history available' }, 404);
    }

    const history = result.rows.map(row => ({
      date: row.collection_date,
      methodology_version: row.methodology_version,
      scores: {
        developer: parseFloat(row.developer_score),
        enterprise: parseFloat(row.enterprise_score),
        researcher: parseFloat(row.researcher_score),
        components: {
          maturity: parseFloat(row.maturity_score),
          capability: parseFloat(row.capability_score),
          performance: parseFloat(row.performance_score),
          usability: parseFloat(row.usability_score),
          reliability: parseFloat(row.reliability_score),
          innovation: parseFloat(row.innovation_score)
        }
      }
    }));

    return c.json({
      framework: {
        name: result.rows[0].name,
        slug: result.rows[0].slug
      },
      history,
      count: history.length,
      days: daysNum
    });
  } catch (error) {
    console.error('Error fetching score history:', error);
    return c.json({ error: 'Failed to fetch score history', message: error.message }, 500);
  }
});

export default app;
