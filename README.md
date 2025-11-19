# Agentic Framework Benchmark System (AFBS)

An automated, continuously-updated platform that analyzes, scores, and compares local agentic frameworks (AI agent orchestration systems). Provides quantifiable, scalable metrics that evolve alongside framework capabilities.

## Features

- **Automated Data Collection**: Daily GitHub metrics, weekly benchmarks, monthly comprehensive analysis
- **Multi-Dimensional Scoring**: 6 component scores (Maturity, Capability, Performance, Usability, Reliability, Innovation)
- **Interactive Web Interface**: Filter, sort, and compare frameworks with ease
- **Real-Time Updates**: Track framework evolution through configuration file versioning
- **Transparent Methodology**: Open source scoring algorithms and data sources

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14
- npm >= 10.0.0

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agentic_framework_benchmark
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create PostgreSQL database
createdb afbs

# Run migrations
npm run db:migrate

# Seed with initial data
npm run db:seed
```

5. Start the development servers:
```bash
# Start both API and web servers
npm run dev

# Or start them separately
npm run dev:api   # API server on http://localhost:3000
npm run dev:web   # Web UI on http://localhost:5173
```

## Project Structure

```
agentic_framework_benchmark/
├── packages/
│   ├── api/           # Hono backend API
│   ├── web/           # SvelteKit frontend
│   ├── database/      # Database schema and migrations
│   └── collector/     # Data collection pipelines
├── package.json       # Root package.json
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Architecture

### Backend (API)

- **Framework**: Hono (TypeScript)
- **Database**: PostgreSQL
- **Runtime**: Node.js

Key endpoints:
- `GET /api/v1/frameworks` - List all frameworks with filters
- `GET /api/v1/frameworks/:slug` - Get framework details
- `GET /api/v1/frameworks/compare?ids=...` - Compare multiple frameworks
- `GET /api/v1/scores/:slug/history` - Get score history
- `GET /api/v1/stats/summary` - Platform-wide statistics

### Frontend (Web)

- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

Pages:
- `/` - Main table view with filters
- `/frameworks/:slug` - Framework detail page
- `/about` - About page with methodology

### Data Collection

Automated pipelines for:
- GitHub metrics (stars, forks, issues, contributors)
- Score calculations based on collected data
- Framework characteristic analysis

Run manually:
```bash
npm run collect        # Run all collectors
npm run collect:github # GitHub metrics only
npm run collect:scores # Score calculations only
```

## Database Schema

Core tables:
- `frameworks` - Framework metadata
- `scores` - Time-series scoring data
- `characteristics` - Binary and quantitative characteristics
- `config_files` - Tracked configuration files
- `benchmark_results` - Performance benchmarks
- `usage_statistics` - Real-world usage metrics

## Scoring Methodology

### Component Scores (0-100)

1. **Maturity Score**: GitHub stars, project age, release frequency, issue resolution
2. **Capability Score**: Binary features, integrated tools, architecture patterns
3. **Performance Score**: Benchmark results, response time, memory efficiency
4. **Usability Score**: Documentation quality, setup complexity, IDE integration
5. **Reliability Score**: MCP success rate, error handling, uptime
6. **Innovation Score**: Unique features, novel architecture, feature velocity

### Overall Scores

- **Developer Score**: Capability (30%) + Performance (25%) + Usability (25%) + Innovation (15%) + Reliability (5%)
- **Enterprise Score**: Reliability (35%) + Maturity (30%) + Performance (20%) + Capability (10%) + Usability (5%)
- **Researcher Score**: Innovation (35%) + Capability (30%) + Performance (20%) + Maturity (10%) + Usability (5%)

## API Usage Examples

### List frameworks with filters

```bash
curl "http://localhost:3000/api/v1/frameworks?environment=cli&license=opensource&min_score=70"
```

### Get framework details

```bash
curl "http://localhost:3000/api/v1/frameworks/langchain"
```

### Compare frameworks

```bash
curl "http://localhost:3000/api/v1/frameworks/compare?ids=langchain,llamaindex,crewai"
```

### Get score history

```bash
curl "http://localhost:3000/api/v1/scores/langchain/history?days=90"
```

## Development

### Running Tests

```bash
# API tests
cd packages/api && npm test

# Frontend tests
cd packages/web && npm test
```

### Database Management

```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

### Adding New Frameworks

1. Add framework to seed data in `packages/database/scripts/seed.js`
2. Run `npm run db:seed`
3. Collect data: `npm run collect`

## Deployment

### Environment Variables

Required for production:
```env
DATABASE_URL=postgresql://user:pass@host:5432/afbs
GITHUB_TOKEN=your_github_token
API_PORT=3000
NODE_ENV=production
```

Optional:
```env
ANTHROPIC_API_KEY=your_key  # For agentic judge feature
REDIS_URL=redis://host:6379  # For caching
```

### Build for Production

```bash
# Build all packages
npm run build

# Start production servers
cd packages/api && npm start
cd packages/web && npm start
```

### Recommended Deployment Platforms

- **API**: Railway, Fly.io, or any Node.js hosting
- **Database**: Neon, Supabase, or Railway
- **Frontend**: Cloudflare Pages, Vercel, or Netlify

## Configuration

### API Configuration

Edit `packages/api/server.js` for:
- CORS settings
- Rate limiting
- Error handling

### Data Collection Schedule

Edit `packages/collector/collect.js` for:
- Collection frequency
- Data sources
- Scoring algorithms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Roadmap

### Phase 1 (Current)
- ✅ Core infrastructure
- ✅ Database schema
- ✅ API endpoints
- ✅ Basic web interface
- ✅ GitHub data collection
- ✅ Scoring engine

### Phase 2 (Planned)
- [ ] Benchmark suite implementation
- [ ] Agentic judge system (Claude API)
- [ ] Configuration file tracking
- [ ] Advanced visualizations (charts, graphs)
- [ ] Real-time usage statistics (OpenRouter, Together.ai)

### Phase 3 (Future)
- [ ] User accounts and saved filters
- [ ] Community voting and reviews
- [ ] Automated framework discovery
- [ ] API rate limiting and caching
- [ ] Mobile app

## License

MIT

## Support

- Documentation: See `/about` page in the web interface
- Issues: GitHub Issues
- Discussions: GitHub Discussions

## Acknowledgments

Built with:
- [Hono](https://hono.dev/) - Fast, lightweight web framework
- [SvelteKit](https://kit.svelte.dev/) - Modern web framework
- [PostgreSQL](https://www.postgresql.org/) - Powerful database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

Inspired by:
- Berkeley Function Calling Leaderboard
- LMSYS Chatbot Arena
- Open LLM Leaderboard
- Can I Use

---

**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Methodology Version**: 1.0.0
