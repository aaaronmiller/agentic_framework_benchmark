<script>
  import { onMount } from 'svelte';

  let frameworks = [];
  let loading = true;
  let error = null;
  let stats = null;

  // Filters
  let filters = {
    environment: '',
    license: '',
    model_support: '',
    min_score: ''
  };

  let sortBy = 'developer_score';
  let sortOrder = 'desc';

  async function loadFrameworks() {
    loading = true;
    error = null;

    try {
      const params = new URLSearchParams();
      if (filters.environment) params.set('environment', filters.environment);
      if (filters.license) params.set('license', filters.license);
      if (filters.model_support) params.set('model_support', filters.model_support);
      if (filters.min_score) params.set('min_score', filters.min_score);

      const response = await fetch(`/api/v1/frameworks?${params}`);
      if (!response.ok) throw new Error('Failed to load frameworks');

      const data = await response.json();
      frameworks = data.data;

      // Sort frameworks
      frameworks.sort((a, b) => {
        let aVal = sortBy === 'name' ? a.name : a.scores.developer;
        let bVal = sortBy === 'name' ? b.name : b.scores.developer;

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/v1/stats/summary');
      if (response.ok) {
        const data = await response.json();
        stats = data.data;
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  onMount(() => {
    loadFrameworks();
    loadStats();
  });

  function resetFilters() {
    filters = {
      environment: '',
      license: '',
      model_support: '',
      min_score: ''
    };
    loadFrameworks();
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
    return num.toString();
  }
</script>

<svelte:head>
  <title>Agentic Framework Benchmark</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Stats Section -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600">Total Frameworks</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.total_frameworks}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600">Average Developer Score</h3>
        <p class="text-3xl font-bold text-gray-900 mt-2">{stats.average_scores.developer}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-600">Top Framework</h3>
        <p class="text-lg font-bold text-gray-900 mt-2">
          {stats.top_frameworks[0]?.name || 'N/A'}
        </p>
        <p class="text-sm text-gray-600">Score: {stats.top_frameworks[0]?.score.toFixed(1) || 'N/A'}</p>
      </div>
    </div>
  {/if}

  <!-- Filters Section -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold mb-4">Filters</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Environment
        </label>
        <select
          bind:value={filters.environment}
          on:change={loadFrameworks}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All</option>
          <option value="cli">CLI</option>
          <option value="docker">Docker</option>
          <option value="vscode">VSCode</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          License
        </label>
        <select
          bind:value={filters.license}
          on:change={loadFrameworks}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All</option>
          <option value="opensource">Open Source</option>
          <option value="free">Free Tier</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Model Support
        </label>
        <select
          bind:value={filters.model_support}
          on:change={loadFrameworks}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All</option>
          <option value="agnostic">Model Agnostic</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Min Score
        </label>
        <input
          type="number"
          bind:value={filters.min_score}
          on:input={loadFrameworks}
          min="0"
          max="100"
          placeholder="0-100"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>

    <div class="mt-4">
      <button on:click={resetFilters} class="btn btn-secondary">
        Reset Filters
      </button>
    </div>
  </div>

  <!-- Frameworks Table -->
  <div class="card">
    <h2 class="text-lg font-semibold mb-4">
      Frameworks ({frameworks.length})
    </h2>

    {#if loading}
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Loading frameworks...</p>
      </div>
    {:else if error}
      <div class="text-center py-12">
        <p class="text-red-600">Error: {error}</p>
      </div>
    {:else if frameworks.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600">No frameworks found matching your criteria.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Framework
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Developer Score
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enterprise Score
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stars
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each frameworks as framework}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {framework.name}
                    </div>
                    <div class="text-sm text-gray-500">
                      {framework.primary_language || 'N/A'}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-sm font-medium {getScoreColor(framework.scores.developer)}">
                    {framework.scores.developer.toFixed(1)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-sm font-medium {getScoreColor(framework.scores.enterprise)}">
                    {framework.scores.enterprise.toFixed(1)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(framework.github_metrics?.stars || 0)}
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    {#if framework.characteristics.open_source}
                      <span class="badge badge-green">Open Source</span>
                    {/if}
                    {#if framework.characteristics.mcp_protocol_support}
                      <span class="badge badge-blue">MCP</span>
                    {/if}
                    {#if framework.characteristics.cli_support}
                      <span class="badge badge-gray">CLI</span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <a
                    href="/frameworks/{framework.slug}"
                    class="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    View Details →
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
