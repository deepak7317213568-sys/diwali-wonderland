/**
 * Diwali Wonderland - Client Analytics & Referral Tracking Service
 * Handles visitor identification, referral attribution persistence, and event tracking.
 */

const VISITOR_ID_KEY = 'diwali_visitor_uuid';
const LOCAL_ACTIVE_REF_KEY = 'diwali_active_ref_code';
const ORIGINAL_REFERRAL_SOURCE_KEY = 'diwali_original_referral_source';
const SESSION_VISIT_LOGGED_KEY = 'diwali_session_visit_logged_v1';
const SESSION_EVENTS_LOGGED_KEY = 'diwali_logged_events_cache';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Generate privacy-preserving random visitor ID
 */
export const generateVisitorId = () => {
  const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return `vis_${rand}`;
};

/**
 * Retrieve or initialize anonymous visitor ID
 */
export const getVisitorId = () => {
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch (e) {
    return generateVisitorId();
  }
};

/**
 * Check if current visitor is a returning visitor
 */
export const isReturningVisitor = () => {
  try {
    return Boolean(localStorage.getItem(VISITOR_ID_KEY));
  } catch (e) {
    return false;
  }
};

/**
 * Safely persist and retrieve active referral code without overwriting with empty/invalid values
 */
export const captureReferralCodeFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');

    if (refParam && refParam.trim().length >= 3) {
      const cleanCode = refParam.trim().toUpperCase();

      // Store in localStorage so it survives page navigation and refreshes
      localStorage.setItem(LOCAL_ACTIVE_REF_KEY, cleanCode);

      // Record original referral source if not already recorded
      if (!localStorage.getItem(ORIGINAL_REFERRAL_SOURCE_KEY)) {
        const sourceInfo = {
          referralCode: cleanCode,
          capturedAt: new Date().toISOString(),
          landingPath: window.location.pathname,
          referrer: document.referrer || 'direct',
        };
        localStorage.setItem(ORIGINAL_REFERRAL_SOURCE_KEY, JSON.stringify(sourceInfo));
      }

      return cleanCode;
    }

    // If no URL ref param, read persisted referral code from localStorage
    return localStorage.getItem(LOCAL_ACTIVE_REF_KEY) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Get active referral code (from localStorage or URL)
 */
export const getActiveReferralCode = () => {
  try {
    return captureReferralCodeFromUrl();
  } catch (e) {
    return null;
  }
};

/**
 * Record a unique visit session (deduplicated per browser session)
 */
export const recordVisit = async (referralCode = null, referrerName = null) => {
  try {
    const vid = getVisitorId();
    const activeRef = referralCode || getActiveReferralCode();
    const isNew = !isReturningVisitor();

    // Prevent duplicate calls on re-renders within the same session
    if (sessionStorage.getItem(SESSION_VISIT_LOGGED_KEY)) {
      return { success: true, cached: true };
    }

    const payload = {
      visitorId: vid,
      referralCode: activeRef || null,
      referrerName: referrerName || null,
      pagePath: window.location.pathname,
      isNewVisitor: isNew,
    };

    const res = await fetch(`${API_BASE}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      sessionStorage.setItem(SESSION_VISIT_LOGGED_KEY, 'true');
      return await res.json();
    }
  } catch (err) {
    // Graceful degradation when offline or during build
  }
  return { success: false };
};

/**
 * Track an interaction event (deduplicated where appropriate)
 * @param {'website_visit' | 'gift_opened' | 'game_started' | 'game_completed' | 'task_completed' | 'invitation_shared'} eventType
 * @param {Object} metadata
 * @param {number|null} stageId
 */
export const trackEvent = async (eventType, metadata = {}, stageId = null) => {
  try {
    const vid = getVisitorId();
    const refCode = getActiveReferralCode();

    // Client-side deduplication for one-time events per session
    const dedupeKey = stageId ? `${eventType}_stage_${stageId}` : eventType;
    let loggedEvents = {};
    try {
      loggedEvents = JSON.parse(sessionStorage.getItem(SESSION_EVENTS_LOGGED_KEY) || '{}');
    } catch (e) {}

    if (['gift_opened', 'game_completed', 'task_completed'].includes(eventType) && loggedEvents[dedupeKey]) {
      return { success: true, duplicate: true };
    }

    const payload = {
      eventType,
      visitorId: vid,
      referralCode: refCode || null,
      stageId: stageId ? Number(stageId) : null,
      metadata: metadata || {},
    };

    const res = await fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      loggedEvents[dedupeKey] = Date.now();
      sessionStorage.setItem(SESSION_EVENTS_LOGGED_KEY, JSON.stringify(loggedEvents));
      return await res.json();
    }
  } catch (err) {
    // Non-blocking fallback
  }
  return { success: false };
};
