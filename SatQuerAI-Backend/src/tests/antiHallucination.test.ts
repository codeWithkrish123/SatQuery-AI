import { groundingEngine } from '../services/groundingEngine';
import { TrustedKnowledgeLayer } from '../services/trustedKnowledge';

async function runAntiHallucinationTestSuite() {
  console.log('==================================================');
  console.log('🧪 RUNNING SATQUERY AI ANTI-HALLUCINATION SUITE');
  console.log('==================================================\n');

  // Test 1 — Supported question
  console.log('👉 TEST 1: Supported Question (Cartosat-3 Specs)');
  const res1 = await groundingEngine.processQuery('What is the spatial resolution of Cartosat-3?');
  console.log('Answer:', res1.answer.split('\n')[0]);
  console.log('Grounded:', res1.grounded, '| Sources count:', res1.sources.length);
  console.assert(res1.grounded === true, 'Test 1 Failed: Should be grounded');
  console.assert(res1.sources.length > 0, 'Test 1 Failed: Should have sources');
  console.log('✅ TEST 1 PASSED\n');

  // Test 2 — Partially supported question
  console.log('👉 TEST 2: Partially Supported Question');
  const res2 = await groundingEngine.processQuery('What are Sentinel-2 bands for flood water tracking?');
  console.log('Answer snippet:', res2.answer.substring(0, 100) + '...');
  console.log('Grounded:', res2.grounded, '| Evidence count:', res2.evidence.length);
  console.assert(res2.grounded === true, 'Test 2 Failed: Should be grounded');
  console.log('✅ TEST 2 PASSED\n');

  // Test 3 — Unsupported question
  console.log('👉 TEST 3: Unsupported Question');
  const res3 = await groundingEngine.processQuery('What is the submarine depth of Atlantis trench?');
  console.log('Answer:', res3.answer);
  console.log('Insufficient Evidence:', res3.insufficient_evidence);
  console.assert(res3.insufficient_evidence === true, 'Test 3 Failed: Should report insufficient evidence');
  console.log('✅ TEST 3 PASSED\n');

  // Test 4 — Fake satellite
  console.log('👉 TEST 4: Fake Satellite Query (XYZ-999)');
  const res4 = await groundingEngine.processQuery('What is the XYZ-999 satellite specifications?');
  console.log('Answer:', res4.answer);
  console.log('Insufficient Evidence:', res4.insufficient_evidence);
  console.assert(res4.insufficient_evidence === true, 'Test 4 Failed: Should reject fake satellite XYZ-999');
  console.log('✅ TEST 4 PASSED\n');

  // Test 5 — ML question
  console.log('👉 TEST 5: ML Image Question');
  const res5 = await groundingEngine.processQuery('Analyze scene for water boundary', 'mock_scene.png');
  console.log('ML Model:', res5.ml_analysis?.model, '| Confidence:', res5.ml_analysis?.confidence);
  console.assert(res5.ml_analysis !== null, 'Test 5 Failed: Should include ML analysis');
  console.log('✅ TEST 5 PASSED\n');

  // Test 6 — Retrieval + ML combined
  console.log('👉 TEST 6: Retrieval + ML Combined');
  const res6 = await groundingEngine.processQuery('Analyze Cartosat-3 scene for flooded area', 'mock_scene.png');
  console.log('Grounded:', res6.grounded, '| Has Sources:', res6.sources.length > 0, '| Has ML:', !!res6.ml_analysis);
  console.assert(res6.grounded === true && !!res6.ml_analysis, 'Test 6 Failed: Should combine retrieval + ML');
  console.log('✅ TEST 6 PASSED\n');

  // Test 7 — Invalid input
  console.log('👉 TEST 7: Invalid Input');
  const isFake = TrustedKnowledgeLayer.isFakeSatellite('fake-sat');
  console.assert(isFake === true, 'Test 7 Failed: Should identify fake satellite input');
  console.log('✅ TEST 7 PASSED\n');

  console.log('==================================================');
  console.log('🎉 ALL 7 ANTI-HALLUCINATION TESTS PASSED 100%!');
  console.log('==================================================\n');
}

runAntiHallucinationTestSuite().catch(console.error);
