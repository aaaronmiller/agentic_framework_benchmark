import dotenv from 'dotenv';
import { collectGitHubMetrics } from './collectors/github.js';
import { calculateScores } from './collectors/scores.js';

dotenv.config({ path: '../../.env' });

async function runCollection() {
  console.log('🚀 Starting data collection pipeline...\n');

  try {
    // Step 1: Collect GitHub metrics
    console.log('📊 Collecting GitHub metrics...');
    await collectGitHubMetrics();
    console.log('✅ GitHub metrics collected\n');

    // Step 2: Calculate scores
    console.log('🔢 Calculating scores...');
    await calculateScores();
    console.log('✅ Scores calculated\n');

    console.log('🎉 Data collection complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

runCollection();
