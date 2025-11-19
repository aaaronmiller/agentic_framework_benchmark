<script>
  import '../app.css';
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            <a href="/" class="hover:text-primary-600">Agentic Framework Benchmark</a>
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            Compare and evaluate local agentic frameworks
          </p>
        </div>
        <nav class="flex gap-6">
          <a href="/" class="text-gray-700 hover:text-primary-600 font-medium">Frameworks</a>
          <a href="/about" class="text-gray-700 hover:text-primary-600 font-medium">About</a>
        </nav>
      </div>
    </div>
  </header>

  <main class="flex-1">
    <slot />
  </main>

  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <p class="text-center text-sm text-gray-600">
        Agentic Framework Benchmark System v1.0.0 | Data updated daily
      </p>
    </div>
  </footer>
</div>
