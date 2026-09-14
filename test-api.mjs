import sproutHandler from './api/sprout-logs.js';
import waitlistHandler from './api/waitlist.js';

async function testAPI(name, handler) {
  console.log(`\n=== Testing ${name} ===`);
  const mockReq = { method: 'GET', url: '/api/test' };
  const mockRes = {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(data) { this.body = data; }
  };

  try {
    await handler(mockReq, mockRes);
    console.log('✅ Success!');
    console.log('Status:', mockRes.statusCode);
    console.log('Body preview:', mockRes.body.substring(0, 150) + '...');
    const parsed = JSON.parse(mockRes.body);
    console.log('Parsed OK:', parsed.ok);
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    console.log('Stack:', err.stack);
  }
}

await testAPI('sprout-logs', sproutHandler);
await testAPI('waitlist', waitlistHandler);
