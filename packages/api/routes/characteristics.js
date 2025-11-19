import { Hono } from 'hono';
import { query } from '../db.js';

const app = new Hono();

// GET /api/v1/characteristics - Get list of all available characteristics for filtering
app.get('/', async (c) => {
  try {
    const characteristics = {
      operating_environment: [
        { id: 'cli_support', label: 'CLI Support', description: 'Command-line interface available' },
        { id: 'docker_support', label: 'Docker Support', description: 'Can run in Docker containers' },
        { id: 'vscode_extension', label: 'VSCode Extension', description: 'Has VSCode extension' },
        { id: 'custom_ui', label: 'Custom UI', description: 'Provides custom user interface' }
      ],
      licensing: [
        { id: 'free_tier', label: 'Free Tier', description: 'Free tier available' },
        { id: 'paid_tier', label: 'Paid Tier', description: 'Paid tier exists' },
        { id: 'open_source', label: 'Open Source', description: 'Open source license' }
      ],
      model_support: [
        { id: 'model_agnostic', label: 'Model Agnostic', description: 'Works with any model' },
        { id: 'predefined_models_only', label: 'Predefined Models Only', description: 'Limited to specific models' },
        { id: 'openai_compatible', label: 'OpenAI Compatible', description: 'Supports OpenAI API' },
        { id: 'anthropic_compatible', label: 'Anthropic Compatible', description: 'Supports Anthropic API' }
      ],
      tools: [
        { id: 'mcp_protocol_support', label: 'MCP Protocol', description: 'Supports MCP protocol' },
        { id: 'custom_tool_integration', label: 'Custom Tool Integration', description: 'Can integrate custom tools' },
        { id: 'web_browsing', label: 'Web Browsing', description: 'Built-in web browsing capability' },
        { id: 'file_system_access', label: 'File System Access', description: 'Can access file system' },
        { id: 'code_execution', label: 'Code Execution', description: 'Can execute code' },
        { id: 'database_access', label: 'Database Access', description: 'Can access databases' },
        { id: 'memory_persistence', label: 'Memory Persistence', description: 'Persistent memory storage' },
        { id: 'image_generation', label: 'Image Generation', description: 'Can generate images' },
        { id: 'image_analysis', label: 'Image Analysis', description: 'Can analyze images' },
        { id: 'pdf_processing', label: 'PDF Processing', description: 'Can process PDF files' },
        { id: 'web_scraping', label: 'Web Scraping', description: 'Built-in web scraping' }
      ],
      architecture: [
        { id: 'subagent_support', label: 'Subagent Support', description: 'Supports multiple agents' },
        { id: 'async_execution', label: 'Async Execution', description: 'Asynchronous task execution' },
        { id: 'parallel_tool_calls', label: 'Parallel Tool Calls', description: 'Can call multiple tools in parallel' },
        { id: 'streaming_responses', label: 'Streaming Responses', description: 'Supports streaming output' }
      ],
      context_management: [
        { id: 'automatic_summarization', label: 'Automatic Summarization', description: 'Automatically summarizes context' },
        { id: 'semantic_compression', label: 'Semantic Compression', description: 'Semantic context compression' },
        { id: 'manual_context_control', label: 'Manual Context Control', description: 'User can control context' },
        { id: 'rag_integration', label: 'RAG Integration', description: 'Integrated RAG capabilities' }
      ]
    };

    return c.json({
      data: characteristics,
      categories: Object.keys(characteristics)
    });
  } catch (error) {
    console.error('Error fetching characteristics:', error);
    return c.json({ error: 'Failed to fetch characteristics', message: error.message }, 500);
  }
});

export default app;
