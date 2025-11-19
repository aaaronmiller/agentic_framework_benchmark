<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let framework = null;
  let loading = true;
  let error = null;

  $: slug = $page.params.slug;

  onMount(async () => {
    await loadFramework();
  });

  async function loadFramework() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`/api/v1/frameworks/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Framework not found');
        }
        throw new Error('Failed to load framework');
      }

      const data = await response.json();
      framework = data.data;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function getScoreColor(score) {
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100';
    if (score >= 40) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() || '0';
  }
</script>

<svelte:head>
  <title>{framework?.name || 'Framework'} | AFBS</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Breadcrumb -->
  <nav class="mb-6">
    <a href="/" class="text-primary-600 hover:text-primary-800">← Back to all frameworks</a>
  </nav>

  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">Loading framework...</p>
    </div>
  {:else if error}
    <div class="card">
      <p class="text-red-600">Error: {error}</p>
    </div>
  {:else if framework}
    <!-- Header -->
    <div class="card mb-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{framework.name}</h1>
          <p class="text-gray-600 mt-2">{framework.description}</p>
          <div class="flex gap-4 mt-4">
            {#if framework.repository_url}
              <a
                href={framework.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Repository →
              </a>
            {/if}
            {#if framework.documentation_url}
              <a
                href={framework.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Documentation →
              </a>
            {/if}
            {#if framework.website_url}
              <a
                href={framework.website_url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Website →
              </a>
            {/if}
          </div>
        </div>
        <div class="text-right">
          <span class="badge badge-blue">{framework.license || 'Unknown'}</span>
          <p class="text-sm text-gray-600 mt-2">v{framework.current_version || 'N/A'}</p>
        </div>
      </div>
    </div>

    <!-- Scores -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Developer Score</h3>
        <p class="text-4xl font-bold {getScoreColor(framework.scores.developer)}">
          {framework.scores.developer.toFixed(1)}
        </p>
        <p class="text-xs text-gray-500 mt-2">Best for development</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Enterprise Score</h3>
        <p class="text-4xl font-bold {getScoreColor(framework.scores.enterprise)}">
          {framework.scores.enterprise.toFixed(1)}
        </p>
        <p class="text-xs text-gray-500 mt-2">Best for production</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600 mb-2">Researcher Score</h3>
        <p class="text-4xl font-bold {getScoreColor(framework.scores.researcher)}">
          {framework.scores.researcher.toFixed(1)}
        </p>
        <p class="text-xs text-gray-500 mt-2">Best for experimentation</p>
      </div>
    </div>

    <!-- Component Scores -->
    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Component Scores</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        {#each Object.entries(framework.scores.components) as [key, value]}
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm font-medium text-gray-700 capitalize">{key}</span>
              <span class="text-sm font-bold">{value.toFixed(1)}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full {value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500'}"
                style="width: {value}%"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- GitHub Metrics -->
    {#if framework.characteristics?.github_metrics}
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">GitHub Metrics</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p class="text-sm text-gray-600">Stars</p>
            <p class="text-2xl font-bold text-gray-900">
              {formatNumber(framework.characteristics.github_metrics.stars)}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Forks</p>
            <p class="text-2xl font-bold text-gray-900">
              {formatNumber(framework.characteristics.github_metrics.forks)}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Contributors</p>
            <p class="text-2xl font-bold text-gray-900">
              {formatNumber(framework.characteristics.github_metrics.contributors)}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Open Issues</p>
            <p class="text-2xl font-bold text-gray-900">
              {formatNumber(framework.characteristics.github_metrics.open_issues)}
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Characteristics -->
    <div class="card mb-6">
      <h2 class="text-xl font-semibold mb-4">Characteristics</h2>

      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Operating Environment</h3>
          <div class="flex flex-wrap gap-2">
            {#if framework.characteristics.operating_environment.cli_support}
              <span class="badge badge-green">CLI Support</span>
            {/if}
            {#if framework.characteristics.operating_environment.docker_support}
              <span class="badge badge-green">Docker Support</span>
            {/if}
            {#if framework.characteristics.operating_environment.vscode_extension}
              <span class="badge badge-green">VSCode Extension</span>
            {/if}
            {#if framework.characteristics.operating_environment.custom_ui}
              <span class="badge badge-green">Custom UI</span>
            {/if}
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Model Support</h3>
          <div class="flex flex-wrap gap-2">
            {#if framework.characteristics.model_support.model_agnostic}
              <span class="badge badge-blue">Model Agnostic</span>
            {/if}
            {#if framework.characteristics.model_support.openai_compatible}
              <span class="badge badge-blue">OpenAI Compatible</span>
            {/if}
            {#if framework.characteristics.model_support.anthropic_compatible}
              <span class="badge badge-blue">Anthropic Compatible</span>
            {/if}
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Tools & Capabilities</h3>
          <div class="flex flex-wrap gap-2">
            {#if framework.characteristics.tools.mcp_protocol_support}
              <span class="badge badge-green">MCP Protocol</span>
            {/if}
            {#if framework.characteristics.tools.custom_tool_integration}
              <span class="badge badge-green">Custom Tools</span>
            {/if}
            {#if framework.characteristics.tools.web_browsing}
              <span class="badge badge-green">Web Browsing</span>
            {/if}
            {#if framework.characteristics.tools.file_system_access}
              <span class="badge badge-green">File System</span>
            {/if}
            {#if framework.characteristics.tools.code_execution}
              <span class="badge badge-green">Code Execution</span>
            {/if}
            {#if framework.characteristics.tools.database_access}
              <span class="badge badge-green">Database Access</span>
            {/if}
            {#if framework.characteristics.tools.memory_persistence}
              <span class="badge badge-green">Memory Persistence</span>
            {/if}
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Architecture</h3>
          <div class="flex flex-wrap gap-2">
            {#if framework.characteristics.architecture.subagent_support}
              <span class="badge badge-blue">Subagents</span>
            {/if}
            {#if framework.characteristics.architecture.async_execution}
              <span class="badge badge-blue">Async Execution</span>
            {/if}
            {#if framework.characteristics.architecture.parallel_tool_calls}
              <span class="badge badge-blue">Parallel Tools</span>
            {/if}
            {#if framework.characteristics.architecture.streaming_responses}
              <span class="badge badge-blue">Streaming</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
