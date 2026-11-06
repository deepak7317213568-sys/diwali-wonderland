process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../src/server.js';

let server;
const PORT = 5002;

const request = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting Dynamic Referrer & Multi-Account Invitation QA Tests...\n');

  server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 400));

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // ==========================================
    // TEST 1: Health check
    // ==========================================
    const health = await request('/api/health');
    assert(health.status === 200, 'Health endpoint responds with 200 OK');

    // ==========================================
    // TEST 2: Account 1 - Deepak Prajapati
    // ==========================================
    const account1 = await request('/api/referrals/create', 'POST', {
      visitorId: 'visitor_deepak_001',
      referrerName: 'Deepak Prajapati',
    });
    assert(account1.status === 201 || account1.status === 200, 'Account 1 created successfully');
    assert(account1.body.referrerName === 'Deepak Prajapati', 'Account 1 name is Deepak Prajapati');
    assert(account1.body.referralCode.startsWith('DEEPAK-'), 'Account 1 code has DEEPAK prefix');
    const code1 = account1.body.referralCode;

    // Lookup Account 1
    const lookup1 = await request(`/api/referrals/lookup/${code1}`);
    assert(lookup1.body.isValid === true, 'Account 1 code lookup is valid');
    assert(lookup1.body.referrerName === 'Deepak Prajapati', 'Account 1 lookup returns "Deepak Prajapati"');

    // ==========================================
    // TEST 3: Account 2 - Rahul
    // ==========================================
    const account2 = await request('/api/referrals/create', 'POST', {
      visitorId: 'visitor_rahul_002',
      referrerName: 'Rahul',
    });
    assert(account2.status === 201 || account2.status === 200, 'Account 2 created successfully');
    assert(account2.body.referrerName === 'Rahul', 'Account 2 name is Rahul');
    assert(account2.body.referralCode.startsWith('RAHUL-'), 'Account 2 code has RAHUL prefix');
    const code2 = account2.body.referralCode;

    // Lookup Account 2
    const lookup2 = await request(`/api/referrals/lookup/${code2}`);
    assert(lookup2.body.isValid === true, 'Account 2 code lookup is valid');
    assert(lookup2.body.referrerName === 'Rahul', 'Account 2 lookup returns "Rahul" (Not hardcoded!)');

    // ==========================================
    // TEST 4: Account 3 - Priya Patel
    // ==========================================
    const account3 = await request('/api/referrals/create', 'POST', {
      visitorId: 'visitor_priya_003',
      referrerName: 'Priya Patel',
    });
    assert(account3.status === 201 || account3.status === 200, 'Account 3 created successfully');
    assert(account3.body.referrerName === 'Priya Patel', 'Account 3 name is Priya Patel');
    assert(account3.body.referralCode.startsWith('PRIYA-'), 'Account 3 code has PRIYA prefix');
    const code3 = account3.body.referralCode;

    // Lookup Account 3
    const lookup3 = await request(`/api/referrals/lookup/${code3}`);
    assert(lookup3.body.isValid === true, 'Account 3 code lookup is valid');
    assert(lookup3.body.referrerName === 'Priya Patel', 'Account 3 lookup returns "Priya Patel" (Not hardcoded!)');

    // ==========================================
    // TEST 5: Invalid / Missing referral code lookup
    // ==========================================
    const lookupInvalid = await request('/api/referrals/lookup/INVALID-CODE-999');
    assert(lookupInvalid.body.isValid === false, 'Invalid referral code is rejected without inventing sender');

    // ==========================================
    // TEST 6: Prevent Self-Referral on Rahul's link
    // ==========================================
    const rahulSelfVisit = await request('/api/referrals/visit', 'POST', {
      referralCode: code2,
      visitorId: 'visitor_rahul_002',
    });
    assert(rahulSelfVisit.body.isSelfReferral === true, 'Rahul visiting own link is rejected as self-referral');

    // ==========================================
    // TEST 7: Priya visiting Rahul's link
    // ==========================================
    const priyaVisitRahul = await request('/api/referrals/visit', 'POST', {
      referralCode: code2,
      visitorId: 'visitor_priya_003',
    });
    assert(priyaVisitRahul.body.isSelfReferral === false, 'Priya visiting Rahul is accepted');
    assert(priyaVisitRahul.body.referrerName === 'Rahul', 'Visit returns Rahul as the inviter');
    assert(priyaVisitRahul.body.isNewVisit === true, 'Visit is counted as new visit for Rahul');

    // ==========================================
    // TEST 8: Prevent duplicate visit counting on repeated refresh
    // ==========================================
    const priyaRepeatVisit = await request('/api/referrals/visit', 'POST', {
      referralCode: code2,
      visitorId: 'visitor_priya_003',
    });
    assert(priyaRepeatVisit.body.isNewVisit === false, 'Repeated visit by same friend is NOT counted again');

    // ==========================================
    // TEST 9: Qualification on finishing adventure
    // ==========================================
    const qualifyRes = await request('/api/referrals/qualify', 'POST', {
      referralCode: code2,
      visitorId: 'visitor_priya_003',
    });
    assert(qualifyRes.body.newlyQualified === true, 'Friend qualification credited to Rahul');
    assert(qualifyRes.body.referrerName === 'Rahul', 'Qualification retains Rahul as inviter');

    // ==========================================
    // TEST 10: Verify stats reflect exactly 1 visit and 1 qualification for Rahul
    // ==========================================
    const rahulStats = await request(`/api/referrals/stats/${code2}`);
    assert(rahulStats.body.totalVisits === 1, 'Rahul total verified visits equals 1');
    assert(rahulStats.body.qualifiedCount === 1, 'Rahul qualified referrals equals 1');

    console.log(`\nQA Test Results: ${passed} Passed, ${failed} Failed.`);
    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();
