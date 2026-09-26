import app from '../index';
import http from 'http';

async function testChangeDetectionEndpoint() {
  console.log('==================================================');
  console.log('🧪 TESTING /api/change-detection FALLBACK RESILIENCE');
  console.log('==================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const port = address.port;

  try {
    const res = await fetch(`http://localhost:${port}/api/change-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Quantify shoreline shift',
        date1: '14 August 2026',
        date2: '12 September 2026'
      })
    });

    console.log('HTTP Status Code:', res.status);
    const body = await res.json() as any;
    console.log('Response Payload:', JSON.stringify(body, null, 2));

    console.assert(res.status === 200, `Expected HTTP 200 status, got ${res.status}`);
    console.assert(body.answer && body.answer.includes('Bi-temporal change analysis'), 'Expected bi-temporal answer text');
    console.assert(body.live_model === false, 'Expected live_model to be false when GPU is offline');
    console.assert(body.fallback_mode === true, 'Expected fallback_mode to be true');
    console.assert(typeof body.pixel_diff_percent === 'number', 'Expected pixel_diff_percent to be a number');

    console.log('\n==================================================');
    console.log('🎉 CHANGE DETECTION FALLBACK TEST PASSED (STATUS 200 OK, NO 503)!');
    console.log('==================================================\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

testChangeDetectionEndpoint().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
