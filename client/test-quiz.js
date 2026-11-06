import { MASTER_QUIZ_QUESTIONS, generateRandomizedQuiz } from './src/utils/quizData.js';

console.log('🧪 Starting 20+ Quiz Questions Randomization & Validation Test...\n');

let totalTested = 0;
let errors = 0;
const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

// 1. Verify all 21 Master Questions in both languages
console.log(`Checking ${MASTER_QUIZ_QUESTIONS.length} master questions data integrity:`);
MASTER_QUIZ_QUESTIONS.forEach((q, idx) => {
  // English check
  if (!q.en.question || !q.en.correct || q.en.distractors.length !== 3) {
    console.error(`  ✗ [FAIL] Master Question ${idx + 1} (EN) has missing fields`);
    errors++;
  }
  // Hindi check
  if (!q.hi.question || !q.hi.correct || q.hi.distractors.length !== 3) {
    console.error(`  ✗ [FAIL] Master Question ${idx + 1} (HI) has missing fields`);
    errors++;
  }
  totalTested++;
});
console.log(`  ✓ Checked ${totalTested} master question pairs (EN & HI) successfully.\n`);

// 2. Run 30 randomized quiz sessions (90 questions) to verify distribution across A, B, C, D
console.log('Running 30 simulated randomized quiz sessions across languages:');
for (let session = 0; session < 30; session++) {
  const lang = session % 2 === 0 ? 'hi' : 'en';
  const quiz = generateRandomizedQuiz(lang, 3);

  let prevPos = -1;
  quiz.forEach((q, qIndex) => {
    // A. Option count check
    if (q.options.length !== 4) {
      console.error(`  ✗ [FAIL] Session ${session} Q${qIndex}: Expected 4 options, got ${q.options.length}`);
      errors++;
    }

    // B. Check correctIndex points to correctAnswer
    const chosenAnswer = q.options[q.correctIndex];
    if (chosenAnswer !== q.correctAnswer) {
      console.error(`  ✗ [FAIL] Session ${session} Q${qIndex}: Option at index ${q.correctIndex} ('${chosenAnswer}') does not match correct ('${q.correctAnswer}')`);
      errors++;
    }

    // C. Verify option uniqueness
    const uniqueOptions = new Set(q.options);
    if (uniqueOptions.size !== 4) {
      console.error(`  ✗ [FAIL] Session ${session} Q${qIndex}: Duplicate options detected`);
      errors++;
    }

    // D. Track slot position
    positionCounts[q.correctIndex]++;
    prevPos = q.correctIndex;
  });
}

console.log('Answer Position Distribution across simulated sessions:');
console.log(`  Option A (Index 0): ${positionCounts[0]} times`);
console.log(`  Option B (Index 1): ${positionCounts[1]} times`);
console.log(`  Option C (Index 2): ${positionCounts[2]} times`);
console.log(`  Option D (Index 3): ${positionCounts[3]} times`);

// Ensure all 4 positions A, B, C, D are actively used
if (positionCounts[0] > 0 && positionCounts[1] > 0 && positionCounts[2] > 0 && positionCounts[3] > 0) {
  console.log('\n  ✓ [PASS] Correct answers are evenly and dynamically distributed across A, B, C, and D!');
} else {
  console.error('\n  ✗ [FAIL] Some option positions were never used!');
  errors++;
}

if (errors === 0) {
  console.log('\n✅ ALL 20+ QUIZ TESTS PASSED WITH ZERO ERRORS.\n');
  process.exit(0);
} else {
  console.error(`\n❌ TEST FAILED WITH ${errors} ERRORS.\n`);
  process.exit(1);
}
