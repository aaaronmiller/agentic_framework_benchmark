import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const seedFrameworks = [
  {
    name: 'LangChain',
    slug: 'langchain',
    description: 'Build context-aware reasoning applications with LLMs',
    repository_url: 'https://github.com/langchain-ai/langchain',
    documentation_url: 'https://python.langchain.com/',
    website_url: 'https://www.langchain.com/',
    license: 'MIT',
    first_release_date: '2022-10-17',
    latest_release_date: '2024-11-15',
    current_version: '0.1.0',
    primary_language: 'Python',
    primary_maintainer: 'LangChain AI'
  },
  {
    name: 'LlamaIndex',
    slug: 'llamaindex',
    description: 'Data framework for LLM applications to ingest, structure, and access data',
    repository_url: 'https://github.com/run-llama/llama_index',
    documentation_url: 'https://docs.llamaindex.ai/',
    website_url: 'https://www.llamaindex.ai/',
    license: 'MIT',
    first_release_date: '2022-11-02',
    latest_release_date: '2024-11-14',
    current_version: '0.9.30',
    primary_language: 'Python',
    primary_maintainer: 'LlamaIndex'
  },
  {
    name: 'AutoGPT',
    slug: 'autogpt',
    description: 'An experimental open-source attempt to make GPT-4 fully autonomous',
    repository_url: 'https://github.com/Significant-Gravitas/AutoGPT',
    documentation_url: 'https://docs.agpt.co/',
    website_url: 'https://autogpt.net/',
    license: 'MIT',
    first_release_date: '2023-03-30',
    latest_release_date: '2024-11-10',
    current_version: '0.5.0',
    primary_language: 'Python',
    primary_maintainer: 'Significant Gravitas'
  },
  {
    name: 'CrewAI',
    slug: 'crewai',
    description: 'Framework for orchestrating role-playing, autonomous AI agents',
    repository_url: 'https://github.com/joaomdmoura/crewAI',
    documentation_url: 'https://docs.crewai.com/',
    website_url: 'https://www.crewai.com/',
    license: 'MIT',
    first_release_date: '2023-10-27',
    latest_release_date: '2024-11-12',
    current_version: '0.28.0',
    primary_language: 'Python',
    primary_maintainer: 'João Moura'
  },
  {
    name: 'Semantic Kernel',
    slug: 'semantic-kernel',
    description: 'Microsoft SDK that integrates LLMs with conventional programming languages',
    repository_url: 'https://github.com/microsoft/semantic-kernel',
    documentation_url: 'https://learn.microsoft.com/en-us/semantic-kernel/',
    website_url: 'https://aka.ms/semantic-kernel',
    license: 'MIT',
    first_release_date: '2023-03-07',
    latest_release_date: '2024-11-13',
    current_version: '1.0.1',
    primary_language: 'C#',
    primary_maintainer: 'Microsoft'
  },
  {
    name: 'LangGraph',
    slug: 'langgraph',
    description: 'Build stateful, multi-actor applications with LLMs',
    repository_url: 'https://github.com/langchain-ai/langgraph',
    documentation_url: 'https://langchain-ai.github.io/langgraph/',
    license: 'MIT',
    first_release_date: '2024-01-17',
    latest_release_date: '2024-11-11',
    current_version: '0.2.0',
    primary_language: 'Python',
    primary_maintainer: 'LangChain AI'
  },
  {
    name: 'Haystack',
    slug: 'haystack',
    description: 'End-to-end NLP framework for building applications powered by LLMs',
    repository_url: 'https://github.com/deepset-ai/haystack',
    documentation_url: 'https://docs.haystack.deepset.ai/',
    website_url: 'https://haystack.deepset.ai/',
    license: 'Apache-2.0',
    first_release_date: '2019-11-18',
    latest_release_date: '2024-11-08',
    current_version: '2.0.0',
    primary_language: 'Python',
    primary_maintainer: 'deepset'
  },
  {
    name: 'AutoGen',
    slug: 'autogen',
    description: 'Multi-agent conversation framework from Microsoft',
    repository_url: 'https://github.com/microsoft/autogen',
    documentation_url: 'https://microsoft.github.io/autogen/',
    license: 'MIT',
    first_release_date: '2023-08-18',
    latest_release_date: '2024-11-09',
    current_version: '0.2.0',
    primary_language: 'Python',
    primary_maintainer: 'Microsoft'
  }
];

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await client.query('DELETE FROM usage_statistics');
    await client.query('DELETE FROM benchmark_results');
    await client.query('DELETE FROM config_files');
    await client.query('DELETE FROM characteristics');
    await client.query('DELETE FROM scores');
    await client.query('DELETE FROM frameworks');

    console.log('📊 Inserting frameworks...');

    // Insert frameworks
    for (const framework of seedFrameworks) {
      const result = await client.query(`
        INSERT INTO frameworks (
          name, slug, description, repository_url, documentation_url,
          website_url, license, first_release_date, latest_release_date,
          current_version, primary_language, primary_maintainer
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        framework.name,
        framework.slug,
        framework.description,
        framework.repository_url,
        framework.documentation_url,
        framework.website_url,
        framework.license,
        framework.first_release_date,
        framework.latest_release_date,
        framework.current_version,
        framework.primary_language,
        framework.primary_maintainer
      ]);

      const frameworkId = result.rows[0].id;
      const today = new Date().toISOString().split('T')[0];

      // Insert sample characteristics
      await client.query(`
        INSERT INTO characteristics (
          framework_id, collection_date,
          cli_support, docker_support, open_source,
          model_agnostic, openai_compatible, anthropic_compatible,
          custom_tool_integration, code_execution, file_system_access,
          github_metrics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        frameworkId,
        today,
        true,
        true,
        true,
        true,
        true,
        framework.slug === 'langchain' || framework.slug === 'crewai',
        true,
        true,
        true,
        JSON.stringify({
          stars: Math.floor(Math.random() * 50000) + 5000,
          forks: Math.floor(Math.random() * 5000) + 500,
          open_issues: Math.floor(Math.random() * 500) + 50,
          contributors: Math.floor(Math.random() * 300) + 20
        })
      ]);

      // Insert sample scores
      const maturityScore = 60 + Math.random() * 30;
      const capabilityScore = 65 + Math.random() * 25;
      const performanceScore = 55 + Math.random() * 35;
      const usabilityScore = 60 + Math.random() * 30;
      const reliabilityScore = 55 + Math.random() * 35;
      const innovationScore = 50 + Math.random() * 40;

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

      await client.query(`
        INSERT INTO scores (
          framework_id, collection_date,
          maturity_score, capability_score, performance_score,
          usability_score, reliability_score, innovation_score,
          developer_score, enterprise_score, researcher_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        frameworkId,
        today,
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

      console.log(`  ✓ ${framework.name}`);
    }

    console.log('✅ Seeding completed successfully!');
    console.log(`📈 Inserted ${seedFrameworks.length} frameworks`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
