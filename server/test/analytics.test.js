process.env.NODE_ENV = 'test';
process.env.ADMIN_PASSWORD = 'TestAdminPassword123';
process.env.ADMIN_SECRET = 'test_secret_for_diwali_analytics';

import assert from 'node:assert';
import http from 'node:http';
import app from '../src/server.js';

let server;
let port;
let baseUrl;

const request = async (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Starting Diwali Analytics & Admin Security QA Tests...\n');

  try {
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(5003, '127.0.0.1', () => {
        port = 5003;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // 1. Visit Recording
    const testVid = `test_vis_${Date.now()}`;
    const visitRes1 = await request('POST', '/api/analytics/visit', {
      visitorId: testVid,
      referralCode: 'DEEPAK-PJFQ',
      referrerName: 'Deepak Prajapati',
      pagePath: '/',
      isNewVisitor: true,
    });
    assert(visitRes1.status === 201, 'Visit record responds with 201 Created');
    assert(visitRes1.body.success === true, 'Visit record success is true');
    assert(visitRes1.body.isDuplicate === false, 'First visit is not duplicate');
    console.log('  ✓ [PASS] Initial visit recorded successfully');

    // 2. Duplicate Visit Prevention (within 24h window)
    const visitRes2 = await request('POST', '/api/analytics/visit', {
      visitorId: testVid,
      referralCode: 'DEEPAK-PJFQ',
      pagePath: '/',
      isNewVisitor: false,
    });
    assert(visitRes2.status === 200, 'Duplicate visit responds with 200 OK');
    assert(visitRes2.body.isDuplicate === true, 'Duplicate visit correctly flagged');
    assert(visitRes2.body.recorded === false, 'Duplicate visit not double-counted');
    console.log('  ✓ [PASS] Duplicate visit within tracking period prevented');

    // 3. Event Recording: website_visit, game_started, game_completed, gift_opened, task_completed, invitation_shared
    const eventsToTest = [
      { eventType: 'game_started', stageId: 2 },
      { eventType: 'game_completed', stageId: 2 },
      { eventType: 'gift_opened', stageId: 4 },
      { eventType: 'task_completed', stageId: 4 },
      { eventType: 'invitation_shared', metadata: { channel: 'whatsapp' } },
    ];

    for (const evt of eventsToTest) {
      const evtRes = await request('POST', '/api/analytics/event', {
        eventType: evt.eventType,
        visitorId: testVid,
        referralCode: 'DEEPAK-PJFQ',
        stageId: evt.stageId,
        metadata: evt.metadata,
      });
      assert(evtRes.status === 201, `Event ${evt.eventType} responds with 201`);
      assert(evtRes.body.success === true, `Event ${evt.eventType} recorded`);
    }
    console.log('  ✓ [PASS] All custom interaction events recorded successfully');

    // 4. Gift Opened Deduplication
    const dupGiftRes = await request('POST', '/api/analytics/event', {
      eventType: 'gift_opened',
      visitorId: testVid,
    });
    assert(dupGiftRes.body.isDuplicate === true, 'Duplicate gift opening prevented');
    console.log('  ✓ [PASS] Duplicate gift opening deduplicated');

    // 5. Admin Security: Unauthorized request to stats must fail
    const unauthRes = await request('GET', '/api/admin/analytics/stats');
    assert(unauthRes.status === 401, 'Unauthenticated stats request returns 401');
    console.log('  ✓ [PASS] Unauthenticated admin access securely blocked');

    // 6. Admin Login with Invalid Password
    const wrongLogin = await request('POST', '/api/admin/login', {
      password: 'wrong_password_attempt',
    });
    assert(wrongLogin.status === 401, 'Wrong password returns 401');
    console.log('  ✓ [PASS] Invalid admin password rejected');

    // 7. Admin Login with Correct Password
    const goodLogin = await request('POST', '/api/admin/login', {
      password: 'TestAdminPassword123',
    });
    assert(goodLogin.status === 200, 'Correct password returns 200');
    assert(goodLogin.body.token, 'Token returned');
    const adminToken = goodLogin.body.token;
    console.log('  ✓ [PASS] Admin login successful & cryptographic token issued');

    // 8. Admin Verify Token
    const verifyRes = await request('GET', '/api/admin/verify', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(verifyRes.status === 200, 'Token verification returns 200');
    assert(verifyRes.body.authenticated === true, 'Token authenticated');
    console.log('  ✓ [PASS] Admin session token validated');

    // 9. Admin Fetch Analytics Stats
    const statsRes = await request('GET', '/api/admin/analytics/stats?range=all', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(statsRes.status === 200, 'Stats returns 200');
    assert(statsRes.body.summary, 'Summary object present');
    assert(statsRes.body.summary.giftOpenings >= 1, 'Gift openings count reflected in stats');
    assert(statsRes.body.summary.invitationsShared >= 1, 'Shares count reflected in stats');
    assert(Array.isArray(statsRes.body.dailyStats), 'Daily stats is an array');
    console.log('  ✓ [PASS] Admin analytics statistics accurately computed');

    // 10. Admin Generate Referral Code
    const genRefRes = await request(
      'POST',
      '/api/admin/referrals/generate',
      {
        referrerName: 'Deepak Prajapati',
        customPrefix: 'DEEPAK',
      },
      {
        Authorization: `Bearer ${adminToken}`,
      }
    );
    assert(genRefRes.status === 201, 'Referral generation returns 201');
    assert(genRefRes.body.referralCode.startsWith('DEEPAK-'), 'Custom prefix respected');
    console.log('  ✓ [PASS] Admin referral link generation functioning');

    console.log('\nAll Analytics & Security QA Tests Passed Successfully! ✨\n');
    process.exit(0);
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
};

runTests();
