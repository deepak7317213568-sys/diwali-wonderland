import crypto from 'crypto';
import mongoose from 'mongoose';
import { Visit } from '../models/Visit.js';
import { Event } from '../models/Event.js';
import { Referral } from '../models/Referral.js';
import { generateAdminToken, getAdminPassword } from '../middleware/adminAuth.js';

// In-memory store fallback when MongoDB Atlas is not yet connected
const inMemoryVisits = [];
const inMemoryEvents = [];
const inMemoryVisitors = new Map(); // visitorId -> { firstSeen, lastSeen, visitCount }

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Parse User-Agent string for device type, browser, and OS
 */
const parseUserAgent = (uaString = '') => {
  const ua = uaString.toLowerCase();

  // Device Type
  let deviceType = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // Browser
  let browser = 'Other';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  // OS
  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
};

/**
 * Generate privacy-preserving salted IP hash
 */
const hashIp = (ip = '') => {
  if (!ip) return null;
  const salt = process.env.IP_SALT || 'diwali_royal_salt_2026';
  return crypto.createHash('sha256').update(ip + salt).digest('hex').slice(0, 16);
};

// ==========================================
// PUBLIC TRACKING CONTROLLERS
// ==========================================

/**
 * Track a unique page visit with deduplication
 */
export const recordVisit = async (req, res) => {
  try {
    const { visitorId, referralCode, referrerName, pagePath, isNewVisitor } = req.body;

    if (!visitorId || typeof visitorId !== 'string' || visitorId.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    const cleanVisitorId = visitorId.trim();
    const cleanRefCode = referralCode ? String(referralCode).trim().toUpperCase() : null;
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const ipHash = hashIp(clientIp.split(',')[0].trim());
    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const cleanPath = pagePath && typeof pagePath === 'string' ? pagePath.trim() : '/';

    const now = new Date();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // MongoDB
    if (isMongoConnected()) {
      // Deduplicate: Has this visitor already been recorded in the past 24 hours?
      const recentVisit = await Visit.findOne({
        visitorId: cleanVisitorId,
        timestamp: { $gte: twentyFourHoursAgo },
      });

      if (recentVisit) {
        return res.status(200).json({
          success: true,
          recorded: false,
          isDuplicate: true,
          message: 'Visit already registered for this 24h session window.',
        });
      }

      const newVisit = await Visit.create({
        visitorId: cleanVisitorId,
        referralCode: cleanRefCode,
        referrerName: referrerName || null,
        isNewVisitor: Boolean(isNewVisitor),
        pagePath: cleanPath,
        deviceType,
        browser,
        os,
        ipHash,
        timestamp: now,
      });

      // Also log website_visit event
      await Event.create({
        eventType: 'website_visit',
        visitorId: cleanVisitorId,
        referralCode: cleanRefCode,
        timestamp: now,
        metadata: { path: cleanPath, browser, deviceType },
      });

      // If referred, ensure referral document reflects visit
      if (cleanRefCode) {
        await Referral.findOneAndUpdate(
          { referralCode: cleanRefCode },
          { $inc: { totalVisits: 1 }, $set: { lastActiveAt: now } }
        ).catch(() => {});
      }

      return res.status(201).json({
        success: true,
        recorded: true,
        isDuplicate: false,
        visitId: newVisit._id,
      });
    }

    // In-memory fallback
    const existing = inMemoryVisitors.get(cleanVisitorId);
    if (existing && Date.now() - existing.lastSeen < 24 * 60 * 60 * 1000) {
      existing.lastSeen = Date.now();
      existing.visitCount = (existing.visitCount || 1) + 1;
      return res.status(200).json({
        success: true,
        recorded: false,
        isDuplicate: true,
        isDemoMode: true,
      });
    }

    inMemoryVisitors.set(cleanVisitorId, {
      firstSeen: existing?.firstSeen || Date.now(),
      lastSeen: Date.now(),
      visitCount: (existing?.visitCount || 0) + 1,
    });

    const visitRecord = {
      _id: `mem_vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      visitorId: cleanVisitorId,
      referralCode: cleanRefCode,
      referrerName: referrerName || null,
      isNewVisitor: !existing,
      pagePath: cleanPath,
      deviceType,
      browser,
      os,
      ipHash,
      timestamp: now,
    };
    inMemoryVisits.push(visitRecord);

    inMemoryEvents.push({
      _id: `mem_evt_${Date.now()}`,
      eventType: 'website_visit',
      visitorId: cleanVisitorId,
      referralCode: cleanRefCode,
      timestamp: now,
      metadata: { path: cleanPath, browser, deviceType },
    });

    return res.status(201).json({
      success: true,
      recorded: true,
      isDuplicate: false,
      isDemoMode: true,
      visitId: visitRecord._id,
    });
  } catch (error) {
    console.error('Record visit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record visit' });
  }
};

/**
 * Track user interaction event
 */
export const recordEvent = async (req, res) => {
  try {
    const { eventType, visitorId, referralCode, stageId, metadata } = req.body;

    const allowedEvents = [
      'website_visit',
      'gift_opened',
      'game_started',
      'game_completed',
      'task_completed',
      'invitation_shared',
    ];

    if (!allowedEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid event type. Allowed: ${allowedEvents.join(', ')}`,
      });
    }

    if (!visitorId || typeof visitorId !== 'string') {
      return res.status(400).json({ success: false, message: 'visitorId is required' });
    }

    const cleanVisitorId = visitorId.trim();
    const cleanRefCode = referralCode ? String(referralCode).trim().toUpperCase() : null;
    const now = new Date();

    // MongoDB
    if (isMongoConnected()) {
      // Deduplicate single-time events per visitor
      if (eventType === 'gift_opened') {
        const alreadyOpened = await Event.findOne({
          eventType: 'gift_opened',
          visitorId: cleanVisitorId,
        });
        if (alreadyOpened) {
          return res.status(200).json({ success: true, recorded: false, isDuplicate: true });
        }
      }

      if (eventType === 'task_completed' && stageId) {
        const alreadyDone = await Event.findOne({
          eventType: 'task_completed',
          visitorId: cleanVisitorId,
          stageId: Number(stageId),
        });
        if (alreadyDone) {
          return res.status(200).json({ success: true, recorded: false, isDuplicate: true });
        }
      }

      const eventDoc = await Event.create({
        eventType,
        visitorId: cleanVisitorId,
        referralCode: cleanRefCode,
        stageId: stageId ? Number(stageId) : null,
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
        timestamp: now,
      });

      // Update Referral document if applicable
      if (cleanRefCode) {
        if (eventType === 'task_completed' && Number(stageId) >= 4) {
          await Referral.findOneAndUpdate(
            {
              referralCode: cleanRefCode,
              'referredVisitors.visitorId': cleanVisitorId,
              'referredVisitors.hasCompletedAdventure': false,
            },
            {
              $set: { 'referredVisitors.$.hasCompletedAdventure': true, lastActiveAt: now },
              $inc: { qualifiedCount: 1 },
            }
          ).catch(() => {});
        }
      }

      return res.status(201).json({
        success: true,
        recorded: true,
        eventId: eventDoc._id,
        eventType,
      });
    }

    // In-memory fallback
    if (eventType === 'gift_opened') {
      const alreadyOpened = inMemoryEvents.some(
        (e) => e.eventType === 'gift_opened' && e.visitorId === cleanVisitorId
      );
      if (alreadyOpened) {
        return res.status(200).json({ success: true, recorded: false, isDuplicate: true, isDemoMode: true });
      }
    }

    const memEvent = {
      _id: `mem_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      visitorId: cleanVisitorId,
      referralCode: cleanRefCode,
      stageId: stageId ? Number(stageId) : null,
      metadata: metadata || {},
      timestamp: now,
    };
    inMemoryEvents.push(memEvent);

    return res.status(201).json({
      success: true,
      recorded: true,
      isDemoMode: true,
      eventId: memEvent._id,
      eventType,
    });
  } catch (error) {
    console.error('Record event error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record event' });
  }
};

// ==========================================
// ADMIN DASHBOARD & ANALYTICS CONTROLLERS
// ==========================================

/**
 * Authenticate admin with password & issue token
 */
export const adminLogin = (req, res) => {
  const { password } = req.body;
  const configuredPassword = getAdminPassword();

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  // Constant time comparison to prevent timing leaks
  const passBuf = Buffer.from(password.trim());
  const confBuf = Buffer.from(configuredPassword.trim());

  const isMatch =
    passBuf.length === confBuf.length && crypto.timingSafeEqual(passBuf, confBuf);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative password.',
    });
  }

  const token = generateAdminToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return res.status(200).json({
    success: true,
    token,
    expiresAt,
    message: 'Admin authentication successful.',
  });
};

/**
 * Verify admin session token
 */
export const adminVerify = (req, res) => {
  return res.status(200).json({
    success: true,
    authenticated: true,
    role: 'admin',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Retrieve comprehensive visitor & referral analytics
 */
export const getAdminStats = async (req, res) => {
  try {
    const range = (req.query.range || '7d').toLowerCase();

    // Determine start date filter
    const now = new Date();
    let startDate = null;
    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const dateFilter = startDate ? { timestamp: { $gte: startDate } } : {};

    // MongoDB Analytics Aggregation
    if (isMongoConnected()) {
      const [
        visits,
        events,
        allReferrals,
      ] = await Promise.all([
        Visit.find(dateFilter).lean(),
        Event.find(dateFilter).lean(),
        Referral.find({}).lean(),
      ]);

      const uniqueVisitorIds = new Set(visits.map((v) => v.visitorId));
      const newVisitorCount = visits.filter((v) => v.isNewVisitor).length;
      const returningVisitorCount = visits.filter((v) => !v.isNewVisitor).length;
      const referralVisitsCount = visits.filter((v) => Boolean(v.referralCode)).length;

      // Event counts
      const giftOpenings = events.filter((e) => e.eventType === 'gift_opened').length;
      const gamesStarted = events.filter((e) => e.eventType === 'game_started').length;
      const gamesCompleted = events.filter((e) => e.eventType === 'game_completed').length;
      const tasksCompleted = events.filter((e) => e.eventType === 'task_completed').length;
      const invitationsShared = events.filter((e) => e.eventType === 'invitation_shared').length;

      // Device & Browser Breakdowns
      const deviceBreakdown = { Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
      const browserBreakdown = {};

      visits.forEach((v) => {
        const d = v.deviceType || 'Unknown';
        deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;

        const b = v.browser || 'Other';
        browserBreakdown[b] = (browserBreakdown[b] || 0) + 1;
      });

      // Top Referrals calculation
      const refMap = new Map();
      allReferrals.forEach((r) => {
        refMap.set(r.referralCode, {
          referralCode: r.referralCode,
          referrerName: r.referrerName,
          totalVisits: r.totalVisits || 0,
          qualifiedCount: r.qualifiedCount || 0,
          giftsOpened: 0,
          tasksCompleted: 0,
          createdAt: r.createdAt,
        });
      });

      events.forEach((e) => {
        if (e.referralCode && refMap.has(e.referralCode)) {
          const r = refMap.get(e.referralCode);
          if (e.eventType === 'gift_opened') r.giftsOpened += 1;
          if (e.eventType === 'task_completed') r.tasksCompleted += 1;
        }
      });

      const topReferrals = Array.from(refMap.values())
        .sort((a, b) => b.totalVisits - a.totalVisits)
        .slice(0, 15);

      // Daily Trends (last 14 days or chosen range)
      const daysCount = range === 'today' ? 1 : range === '30d' ? 30 : 7;
      const dailyStatsMap = new Map();

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayKey = d.toISOString().split('T')[0];
        dailyStatsMap.set(dayKey, {
          date: dayKey,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          visitors: 0,
          visits: 0,
          gifts: 0,
          shares: 0,
        });
      }

      visits.forEach((v) => {
        const key = new Date(v.timestamp).toISOString().split('T')[0];
        if (dailyStatsMap.has(key)) {
          const entry = dailyStatsMap.get(key);
          entry.visits += 1;
        }
      });

      events.forEach((e) => {
        const key = new Date(e.timestamp).toISOString().split('T')[0];
        if (dailyStatsMap.has(key)) {
          const entry = dailyStatsMap.get(key);
          if (e.eventType === 'gift_opened') entry.gifts += 1;
          if (e.eventType === 'invitation_shared') entry.shares += 1;
        }
      });

      return res.status(200).json({
        success: true,
        isDbConnected: true,
        range,
        summary: {
          totalUniqueVisitors: uniqueVisitorIds.size,
          totalVisits: visits.length,
          newVisitors: newVisitorCount,
          returningVisitors: returningVisitorCount,
          referralVisits: referralVisitsCount,
          giftOpenings,
          gamesStarted,
          gamesCompleted,
          tasksCompleted,
          invitationsShared,
        },
        deviceBreakdown,
        browserBreakdown,
        topReferrals,
        dailyStats: Array.from(dailyStatsMap.values()),
      });
    }

    // In-memory stats calculation
    const filteredVisits = startDate
      ? inMemoryVisits.filter((v) => new Date(v.timestamp) >= startDate)
      : inMemoryVisits;

    const filteredEvents = startDate
      ? inMemoryEvents.filter((e) => new Date(e.timestamp) >= startDate)
      : inMemoryEvents;

    const uniqueVisitorIds = new Set(filteredVisits.map((v) => v.visitorId));
    const newVisitorCount = filteredVisits.filter((v) => v.isNewVisitor).length;
    const returningVisitorCount = filteredVisits.filter((v) => !v.isNewVisitor).length;
    const referralVisitsCount = filteredVisits.filter((v) => Boolean(v.referralCode)).length;

    const giftOpenings = filteredEvents.filter((e) => e.eventType === 'gift_opened').length;
    const gamesStarted = filteredEvents.filter((e) => e.eventType === 'game_started').length;
    const gamesCompleted = filteredEvents.filter((e) => e.eventType === 'game_completed').length;
    const tasksCompleted = filteredEvents.filter((e) => e.eventType === 'task_completed').length;
    const invitationsShared = filteredEvents.filter((e) => e.eventType === 'invitation_shared').length;

    const deviceBreakdown = { Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0 };
    const browserBreakdown = {};

    filteredVisits.forEach((v) => {
      const d = v.deviceType || 'Unknown';
      deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;
      const b = v.browser || 'Other';
      browserBreakdown[b] = (browserBreakdown[b] || 0) + 1;
    });

    const daysCount = range === 'today' ? 1 : range === '30d' ? 30 : 7;
    const dailyStatsMap = new Map();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayKey = d.toISOString().split('T')[0];
      dailyStatsMap.set(dayKey, {
        date: dayKey,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: 0,
        visits: 0,
        gifts: 0,
        shares: 0,
      });
    }

    filteredVisits.forEach((v) => {
      const key = new Date(v.timestamp).toISOString().split('T')[0];
      if (dailyStatsMap.has(key)) {
        dailyStatsMap.get(key).visits += 1;
      }
    });

    filteredEvents.forEach((e) => {
      const key = new Date(e.timestamp).toISOString().split('T')[0];
      if (dailyStatsMap.has(key)) {
        const entry = dailyStatsMap.get(key);
        if (e.eventType === 'gift_opened') entry.gifts += 1;
        if (e.eventType === 'invitation_shared') entry.shares += 1;
      }
    });

    return res.status(200).json({
      success: true,
      isDbConnected: false,
      isDemoMode: true,
      range,
      summary: {
        totalUniqueVisitors: uniqueVisitorIds.size,
        totalVisits: filteredVisits.length,
        newVisitors: newVisitorCount,
        returningVisitors: returningVisitorCount,
        referralVisits: referralVisitsCount,
        giftOpenings,
        gamesStarted,
        gamesCompleted,
        tasksCompleted,
        invitationsShared,
      },
      deviceBreakdown,
      browserBreakdown,
      topReferrals: [],
      dailyStats: Array.from(dailyStatsMap.values()),
    });
  } catch (error) {
    console.error('Admin stats calculation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute analytics' });
  }
};

/**
 * Admin: Generate custom referral code
 */
export const adminGenerateReferral = async (req, res) => {
  try {
    const { referrerName, customPrefix } = req.body;
    const name = referrerName && typeof referrerName === 'string' && referrerName.trim()
      ? referrerName.trim()
      : 'Deepak Prajapati';

    const prefix = (customPrefix || name.split(/\s+/)[0] || 'DEEPAK')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'DEEPAK';

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    const randomBytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      rand += chars[randomBytes[i] % chars.length];
    }
    const referralCode = `${prefix}-${rand}`;
    const creatorVisitorId = `admin_${Date.now()}`;

    if (isMongoConnected()) {
      const newRef = await Referral.create({
        referralCode,
        creatorVisitorId,
        referrerName: name,
        totalVisits: 0,
        qualifiedCount: 0,
      });

      return res.status(201).json({
        success: true,
        referralCode: newRef.referralCode,
        referrerName: newRef.referrerName,
        shareUrl: `/?ref=${newRef.referralCode}`,
      });
    }

    return res.status(201).json({
      success: true,
      isDemoMode: true,
      referralCode,
      referrerName: name,
      shareUrl: `/?ref=${referralCode}`,
    });
  } catch (error) {
    console.error('Admin generate referral error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate referral code' });
  }
};

/**
 * Admin: List all referrals with full metrics
 */
export const adminListReferrals = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const referrals = await Referral.find({}).sort({ totalVisits: -1 }).lean();
      return res.status(200).json({
        success: true,
        referrals: referrals.map((r) => ({
          referralCode: r.referralCode,
          referrerName: r.referrerName,
          totalVisits: r.totalVisits || 0,
          qualifiedCount: r.qualifiedCount || 0,
          createdAt: r.createdAt,
        })),
      });
    }

    return res.status(200).json({
      success: true,
      isDemoMode: true,
      referrals: [
        {
          referralCode: 'DEEPAK-PJFQ',
          referrerName: 'Deepak Prajapati',
          totalVisits: inMemoryVisits.filter((v) => v.referralCode === 'DEEPAK-PJFQ').length,
          qualifiedCount: 0,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error('Admin list referrals error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list referrals' });
  }
};
