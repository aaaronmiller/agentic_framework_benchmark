<svelte:head>
  <title>About | Agentic Framework Benchmark</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="card">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">About AFBS</h1>

    <div class="prose max-w-none">
      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">What is AFBS?</h2>
      <p class="text-gray-700 mb-4">
        The Agentic Framework Benchmark System (AFBS) is an automated platform that analyzes,
        scores, and compares local agentic frameworks (AI agent orchestration systems). It provides
        quantifiable metrics that help developers, researchers, and organizations identify the
        optimal framework for their specific use cases.
      </p>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Key Features</h2>
      <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Automated tracking of framework evolution through configuration file versioning</li>
        <li>Real-world usage metrics from API providers</li>
        <li>Comprehensive scoring across 6 dimensions: Maturity, Capability, Performance, Usability, Reliability, and Innovation</li>
        <li>Interactive filtering and comparison tools</li>
        <li>Transparent methodology with public data sources</li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Scoring Methodology</h2>
      <p class="text-gray-700 mb-4">
        Each framework receives scores in 6 categories (0-100 scale):
      </p>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 class="font-semibold text-gray-900 mb-2">Developer Score</h3>
        <p class="text-sm text-gray-700">
          Weighted for building applications: Capability (30%), Performance (25%), Usability (25%), Innovation (15%), Reliability (5%)
        </p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 class="font-semibold text-gray-900 mb-2">Enterprise Score</h3>
        <p class="text-sm text-gray-700">
          Weighted for production systems: Reliability (35%), Maturity (30%), Performance (20%), Capability (10%), Usability (5%)
        </p>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 class="font-semibold text-gray-900 mb-2">Researcher Score</h3>
        <p class="text-sm text-gray-700">
          Weighted for experimentation: Innovation (35%), Capability (30%), Performance (20%), Maturity (10%), Usability (5%)
        </p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sources</h2>
      <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>GitHub API for repository metrics (stars, forks, issues, commits)</li>
        <li>Framework documentation and configuration files</li>
        <li>Community feedback and usage statistics</li>
        <li>Automated benchmark testing</li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Update Frequency</h2>
      <p class="text-gray-700 mb-4">
        The platform runs automated data collection:
      </p>
      <ul class="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Daily:</strong> GitHub metrics, release tracking, configuration changes</li>
        <li><strong>Weekly:</strong> Benchmark suite execution, score calculations</li>
        <li><strong>Monthly:</strong> Comprehensive analysis and methodology reviews</li>
      </ul>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Technology Stack</h2>
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-sm text-gray-700"><strong>Frontend:</strong> SvelteKit, Tailwind CSS</p>
        <p class="text-sm text-gray-700"><strong>Backend:</strong> Hono (TypeScript), PostgreSQL</p>
        <p class="text-sm text-gray-700"><strong>Data Collection:</strong> GitHub API, Octokit</p>
        <p class="text-sm text-gray-700"><strong>Deployment:</strong> Cloudflare Pages/Workers</p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Open Source</h2>
      <p class="text-gray-700 mb-4">
        AFBS is open source and welcomes contributions. The codebase, methodology, and data
        collection pipelines are all publicly available for review and improvement.
      </p>

      <div class="mt-8 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Version 1.0.0 | Methodology Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
</div>
