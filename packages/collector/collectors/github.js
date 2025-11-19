import { Octokit } from '@octokit/rest';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

function extractOwnerRepo(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}

export async function collectGitHubMetrics() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT id, name, slug, repository_url
      FROM frameworks
      WHERE is_active = true
    `);

    const today = new Date().toISOString().split('T')[0];

    for (const framework of result.rows) {
      console.log(`  📦 ${framework.name}...`);

      const parsed = extractOwnerRepo(framework.repository_url);
      if (!parsed) {
        console.log(`    ⚠️  Invalid GitHub URL, skipping`);
        continue;
      }

      try {
        // Get repository data
        const { data: repo } = await octokit.repos.get({
          owner: parsed.owner,
          repo: parsed.repo
        });

        // Get contributors count
        const { data: contributors } = await octokit.repos.listContributors({
          owner: parsed.owner,
          repo: parsed.repo,
          per_page: 1
        });

        // Get commits in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: commits } = await octokit.repos.listCommits({
          owner: parsed.owner,
          repo: parsed.repo,
          since: sevenDaysAgo.toISOString(),
          per_page: 100
        });

        // Get open and recently closed issues
        const { data: openIssues } = await octokit.issues.listForRepo({
          owner: parsed.owner,
          repo: parsed.repo,
          state: 'open',
          per_page: 1
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: closedIssues } = await octokit.issues.listForRepo({
          owner: parsed.owner,
          repo: parsed.repo,
          state: 'closed',
          since: thirtyDaysAgo.toISOString(),
          per_page: 100
        });

        const githubMetrics = {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          open_issues: repo.open_issues_count,
          closed_issues_30d: closedIssues.length,
          commits_7d: commits.length,
          contributors: parseInt(octokit.request.endpoint('GET /repos/{owner}/{repo}/contributors', {
            owner: parsed.owner,
            repo: parsed.repo
          }).headers.link?.match(/page=(\d+)>; rel="last"/)?.[1] || contributors.length),
          size: repo.size,
          language: repo.language,
          last_updated: repo.updated_at
        };

        // Update or insert characteristics
        await client.query(`
          INSERT INTO characteristics (
            framework_id, collection_date, github_metrics
          ) VALUES ($1, $2, $3)
          ON CONFLICT (framework_id, collection_date)
          DO UPDATE SET
            github_metrics = $3,
            created_at = NOW()
        `, [framework.id, today, JSON.stringify(githubMetrics)]);

        console.log(`    ✓ Stars: ${githubMetrics.stars}, Forks: ${githubMetrics.forks}, Contributors: ${githubMetrics.contributors}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.status === 404) {
          console.log(`    ⚠️  Repository not found, skipping`);
        } else if (error.status === 403) {
          console.log(`    ⚠️  Rate limit exceeded, stopping`);
          break;
        } else {
          console.log(`    ⚠️  Error: ${error.message}`);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Run standalone if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  collectGitHubMetrics()
    .then(() => {
      console.log('✅ GitHub metrics collection complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
