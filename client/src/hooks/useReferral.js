import { useState, useEffect, useCallback } from 'react';

const VISITOR_ID_KEY = 'diwali_visitor_uuid';
const LOCAL_REF_CODE_KEY = 'diwali_user_referral_code';
const LOCAL_USER_NAME_KEY = 'diwali_user_custom_name';
const ACTIVE_REFERRER_SESSION_KEY = 'diwali_active_referrer_v1';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const generateClientVisitorId = () => {
  const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  return `visitor_${rand}`;
};

const generateLocalReferralCode = (name = 'DEEPAK') => {
  const cleanPrefix = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'DIWALI';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${cleanPrefix}-${res}`;
};

export const useReferral = () => {
  const [visitorId, setVisitorId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_USER_NAME_KEY) || 'Deepak Prajapati';
    } catch (e) {
      return 'Deepak Prajapati';
    }
  });

  // Active inviter information when current user arrived via someone's link
  const [activeReferrer, setActiveReferrer] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ACTIVE_REFERRER_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return { isValid: false, referrerName: null, referralCode: null };
  });

  const [referralStats, setReferralStats] = useState({
    totalVisits: 0,
    qualifiedCount: 0,
    isDbConnected: false,
    isDemoMode: true,
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initialize Visitor ID and extract ?ref= query parameter
  useEffect(() => {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = generateClientVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    setVisitorId(vid);

    // Read ?ref= from URL
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        const cleanRef = ref.toUpperCase().trim();

        // Lookup referrer details from backend
        fetch(`${API_BASE}/referrals/lookup/${encodeURIComponent(cleanRef)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.success && data.referrerName) {
              const refInfo = {
                isValid: true,
                referrerName: data.referrerName,
                referralCode: cleanRef,
              };
              setActiveReferrer(refInfo);
              sessionStorage.setItem(ACTIVE_REFERRER_SESSION_KEY, JSON.stringify(refInfo));

              // Record visit
              const loggedKey = `diwali_visited_${cleanRef}`;
              if (!sessionStorage.getItem(loggedKey)) {
                fetch(`${API_BASE}/referrals/visit`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ referralCode: cleanRef, visitorId: vid }),
                }).then(() => sessionStorage.setItem(loggedKey, 'true'));
              }
            } else {
              // Invalid code: do not invent a sender name
              const fallbackInfo = { isValid: false, referrerName: null, referralCode: cleanRef };
              setActiveReferrer(fallbackInfo);
              sessionStorage.setItem(ACTIVE_REFERRER_SESSION_KEY, JSON.stringify(fallbackInfo));
            }
          })
          .catch(() => {
            // If backend is completely offline in local test, check prefix as demo hint
            const parts = cleanRef.split('-');
            const demoName = parts.length > 1 && parts[0].length >= 3 
              ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() 
              : null;

            const fallbackInfo = {
              isValid: !!demoName,
              referrerName: demoName,
              referralCode: cleanRef,
            };
            setActiveReferrer(fallbackInfo);
            sessionStorage.setItem(ACTIVE_REFERRER_SESSION_KEY, JSON.stringify(fallbackInfo));
          });
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  // 2. Initialize or fetch this user's personal referral code
  const initializeReferralCode = useCallback(async (currentVid, currentName) => {
    if (!currentVid) return;
    setIsLoading(true);

    let savedCode = localStorage.getItem(LOCAL_REF_CODE_KEY);

    try {
      const response = await fetch(`${API_BASE}/referrals/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: currentVid,
          referrerName: currentName || 'Deepak Prajapati',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.referralCode) {
          setReferralCode(data.referralCode);
          if (data.referrerName) setUserName(data.referrerName);
          localStorage.setItem(LOCAL_REF_CODE_KEY, data.referralCode);
          setReferralStats({
            totalVisits: data.totalVisits || 0,
            qualifiedCount: data.qualifiedCount || 0,
            isDbConnected: !!data.isDbConnected,
            isDemoMode: !!data.isDemoMode,
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend referral API notice: Running standalone mode.');
    }

    if (!savedCode) {
      savedCode = generateLocalReferralCode(currentName || 'DEEPAK');
      localStorage.setItem(LOCAL_REF_CODE_KEY, savedCode);
    }
    setReferralCode(savedCode);
    setReferralStats({
      totalVisits: 0,
      qualifiedCount: 0,
      isDbConnected: false,
      isDemoMode: true,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (visitorId) {
      initializeReferralCode(visitorId, userName);
    }
  }, [visitorId, userName, initializeReferralCode]);

  // 3. Update the inviter's personal display name
  const updateUserName = useCallback(async (newName) => {
    if (!newName || newName.trim().length < 2) return false;
    const cleanName = newName.trim();
    setUserName(cleanName);
    localStorage.setItem(LOCAL_USER_NAME_KEY, cleanName);

    try {
      const res = await fetch(`${API_BASE}/referrals/update-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          referrerName: cleanName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.referralCode) {
            setReferralCode(data.referralCode);
            localStorage.setItem(LOCAL_REF_CODE_KEY, data.referralCode);
          }
          return true;
        }
      }
    } catch (e) {
      // local fallback: update code prefix
      const newCode = generateLocalReferralCode(cleanName);
      setReferralCode(newCode);
      localStorage.setItem(LOCAL_REF_CODE_KEY, newCode);
      return true;
    }
    return true;
  }, [visitorId]);

  // 4. Qualify referral upon completion of adventure
  const recordQualification = useCallback(async () => {
    if (!activeReferrer.isValid || !activeReferrer.referralCode || !visitorId) return;

    const qualKey = `diwali_qualified_${activeReferrer.referralCode}`;
    if (sessionStorage.getItem(qualKey)) return;

    try {
      const res = await fetch(`${API_BASE}/referrals/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: activeReferrer.referralCode,
          visitorId,
        }),
      });
      if (res.ok) {
        sessionStorage.setItem(qualKey, 'true');
      }
    } catch (e) {
      // demo fallback
    }
  }, [activeReferrer, visitorId]);

  // 5. Construct absolute share link
  const getShareUrl = useCallback(() => {
    const origin = window.location.origin;
    return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
  }, [referralCode]);

  const copyShareLink = useCallback(async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
      return true;
    } catch (e) {
      return false;
    }
  }, [getShareUrl]);

  const getWhatsAppShareUrl = useCallback((language = 'en') => {
    const url = getShareUrl();
    const inviter = userName || 'Deepak Prajapati';
    const text = language === 'hi'
      ? `🪔 शुभ दीपावली! ${inviter} ने आपके लिए एक भव्य व जादुई दीवाली अनुभव भेजा है। अपना विशेष उपहार और आतिशबाजी यहाँ खोलें: ${url} ✨`
      : `🪔 Happy Diwali! ${inviter} has sent you a magical royal Diwali adventure. Open your surprise gift and celebrate here: ${url} ✨`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }, [getShareUrl, userName]);

  const shareNative = useCallback(async (language = 'en') => {
    const url = getShareUrl();
    const inviter = userName || 'Deepak Prajapati';
    const title = language === 'hi' ? 'दीवाली वंडरलैंड - शाही दीवाली अनुभव' : 'Diwali Wonderland — The Royal Diwali Adventure';
    const text = language === 'hi'
      ? `🪔 शुभ दीपावली! ${inviter} ने आपके लिए एक भव्य व जादुई दीवाली अनुभव भेजा है: ${url} ✨`
      : `🪔 Happy Diwali! ${inviter} has sent you a magical royal Diwali adventure: ${url} ✨`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return copyShareLink();
    }
  }, [getShareUrl, userName, copyShareLink]);

  return {
    visitorId,
    userName,
    referralCode,
    activeReferrer,
    referralStats,
    isCopied,
    isLoading,
    getShareUrl,
    copyShareLink,
    getWhatsAppShareUrl,
    shareNative,
    updateUserName,
    recordQualification,
    refreshStats: () => initializeReferralCode(visitorId, userName),
  };
};
