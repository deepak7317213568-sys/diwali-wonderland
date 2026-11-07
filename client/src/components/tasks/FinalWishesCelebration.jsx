import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Share2, RotateCcw, Heart, ArrowRight, Edit2, Save, Send, Check } from 'lucide-react';
import gsap from 'gsap';
import { triggerFestiveConfetti, triggerGoldenShower } from '../../utils/confetti.js';
import { audioEngine } from '../../utils/audioSystem.js';
import { getTranslation } from '../../utils/translations.js';
import { trackEvent } from '../../utils/analyticsService.js';

export const FinalWishesCelebration = ({
  language = 'en',
  onReplay,
  onProceedToReferrals,
  activeReferrer,
  userName,
  updateUserName,
  getShareUrl,
  getWhatsAppShareUrl,
  shareNative,
  referralCode,
}) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const headingRef = useRef(null);
  const linesRef = useRef([]);
  const signatureRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Dynamic referrer / sender state
  const isInvited = !!(activeReferrer && activeReferrer.isValid && activeReferrer.referrerName);
  const inviterName = isInvited ? activeReferrer.referrerName : null;

  const [showMyOwnCard, setShowMyOwnCard] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || 'Deepak Prajapati');
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  useEffect(() => {
    if (userName) {
      setNameInput(userName);
    }
  }, [userName]);

  // Current display name on the wish card
  const currentSenderName = (isInvited && !showMyOwnCard)
    ? inviterName
    : (userName || 'Deepak Prajapati');

  const t = (key) => getTranslation(language, key);

  const hindiPoemLines = [
    "इस दिवाली आपके घर में खुशियों की ऐसी रोशनी हो, जो हर ग़म को दूर कर दे।",
    "आपकी मेहनत को सफलता मिले, आपके सपनों को नई उड़ान मिले और आपके अपनों का साथ हमेशा बना रहे।",
    "हर दिन नई उम्मीद लेकर आए और ज़िंदगी प्यार, सुख, शांति और समृद्धि से जगमगाती रहे।",
    "आप सभी को दिल से दीपावली की हार्दिक शुभकामनाएँ!",
  ];

  const englishQuote =
    '"May this beautiful festival bring brighter days, happier moments, beautiful beginnings and endless reasons to smile."';

  // GSAP Cinematic Entrance Timeline
  useEffect(() => {
    triggerGoldenShower();
    triggerFestiveConfetti();
    audioEngine.playGiftOpen();

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (headingRef.current) {
      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: -25, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0 }
      );
    }

    if (cardRef.current) {
      tl.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.94, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1 },
        '-=0.5'
      );
    }

    if (linesRef.current && linesRef.current.length > 0) {
      tl.fromTo(
        linesRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.22 },
        '-=0.4'
      );
    }

    if (signatureRef.current) {
      tl.fromTo(
        signatureRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8 },
        '-=0.2'
      );
    }
  }, []);

  const handleSaveName = async (e) => {
    if (e) e.preventDefault();
    if (!nameInput || nameInput.trim().length < 2) return;
    const clean = nameInput.trim();
    if (updateUserName) {
      await updateUserName(clean);
    }
    setIsEditingName(false);
    setNameSavedSuccess(true);
    triggerFestiveConfetti();
    setTimeout(() => setNameSavedSuccess(false), 3000);
  };

  const effectiveShareUrl = getShareUrl ? getShareUrl() : `${window.location.origin}/?ref=${referralCode || ''}`;
  const senderForSharing = userName || 'Deepak Prajapati';

  const handleShareWishes = async () => {
    audioEngine.playTap();
    trackEvent('invitation_shared', { channel: 'wishes_card_share', language });
    const shareText =
      language === 'hi'
        ? `✨ शुभ दीपावली ✨\n\nइस दिवाली आपके घर में खुशियों की ऐसी रोशनी हो, जो हर ग़म को दूर कर दे।\nआपकी मेहनत को सफलता मिले, आपके सपनों को नई उड़ान मिले और आपके अपनों का साथ हमेशा बना रहे।\n\n- सप्रेम व शुभाशीष सहित,\n${senderForSharing} 💛\n\n🪔 शाही 3D दीवाली अनुभव और अपना विशेष उपहार यहाँ खोलें:\n${effectiveShareUrl}`
        : `✨ HAPPY DIWALI ✨\n\nMay this beautiful festival bring brighter days, happier moments, beautiful beginnings and endless reasons to smile.\n\n- With Love & Best Wishes,\n${senderForSharing} 💛\n\n🪔 Step into the Royal 3D Diwali Wonderland & discover your surprise gift:\n${effectiveShareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Diwali Wonderland Wishes',
          text: shareText,
          url: effectiveShareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleWhatsAppShare = () => {
    audioEngine.playTap();
    trackEvent('invitation_shared', { channel: 'wishes_card_whatsapp', language });
    if (getWhatsAppShareUrl) {
      window.open(getWhatsAppShareUrl(language), '_blank');
    } else {
      const text =
        language === 'hi'
          ? `🪔 शुभ दीपावली! ${senderForSharing} ने आपके लिए एक भव्य व जादुई दीवाली अनुभव भेजा है: ${effectiveShareUrl} ✨`
          : `🪔 Happy Diwali! ${senderForSharing} has sent you a magical royal Diwali adventure: ${effectiveShareUrl} ✨`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleReplayAnimation = () => {
    audioEngine.playTap();
    triggerFestiveConfetti();
    if (onReplay) onReplay();
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center"
    >
      {/* Main Top Heading */}
      <div ref={headingRef} className="text-center mb-8 max-w-2xl">
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-cormorant font-bold gold-gradient-text tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] ${
            language === 'hi' ? 'font-devanagari' : ''
          }`}
        >
          {t('stage7Title')}
        </h2>
      </div>

      {/* Luxury Centered Burgundy Greeting Card (Matching user screenshots with 100% dynamic sender name) */}
      <div
        ref={cardRef}
        className="w-full luxury-wishes-card p-6 sm:p-12 md:p-14 relative overflow-hidden"
      >
        {/* Corner Diya Icon: Top Left (Glowing) */}
        <div className="absolute top-5 left-5 sm:top-7 sm:left-7 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl animate-float filter drop-shadow-[0_0_15px_#FF8A24]">
            🪔
          </span>
        </div>

        {/* Corner Diya Icon: Top Right (Glowing) */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-7 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl animate-float filter drop-shadow-[0_0_15px_#FF8A24]" style={{ animationDelay: '1.5s' }}>
            🪔
          </span>
        </div>

        {/* Inner Card Content */}
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center pt-6 sm:pt-4">
          {/* Hindi Wishes Poetry Block */}
          <div className="space-y-4 mb-8">
            {hindiPoemLines.map((line, idx) => (
              <p
                key={idx}
                ref={(el) => (linesRef.current[idx] = el)}
                className={`font-devanagari text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-wide ${
                  idx === hindiPoemLines.length - 1
                    ? 'text-[#FFD36A] font-bold text-lg sm:text-xl md:text-2xl mt-4 pt-2'
                    : 'text-[#FFF9ED]/95'
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Delicate Golden Divider Line */}
          <div className="w-48 sm:w-64 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFD36A]/80 to-transparent my-4" />

          {/* English Quote (in Elegant Serif Italics) */}
          <p
            ref={(el) => (linesRef.current[hindiPoemLines.length] = el)}
            className="font-cormorant italic text-base sm:text-lg md:text-xl text-[#FFF0C2]/90 max-w-xl mx-auto leading-relaxed font-normal mb-8 px-2"
          >
            {englishQuote}
          </p>

          {/* Personal Signature (Dynamic Referrer Name / Inviter Name / Custom User Name) */}
          <div ref={signatureRef} className="pt-2 flex flex-col items-center w-full">
            <span className="font-cormorant text-xs sm:text-sm text-[#FFD36A]/80 tracking-widest uppercase mb-1">
              {t('signatureIntro')}
            </span>

            {/* If not editing, display dynamic sender name + quick edit pencil */}
            {!isEditingName ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-cormorant text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFD36A] tracking-wider flex items-center justify-center gap-2">
                  {currentSenderName} <span className="text-amber-300">💛</span>
                </span>

                {/* If viewing own card (or not invited), allow quick name editing right here */}
                {(!isInvited || showMyOwnCard) && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 rounded-full text-[#FFF0C2]/70 hover:text-[#FFD36A] hover:bg-[#FFD36A]/10 transition-colors"
                    title={language === 'hi' ? 'नाम बदलें' : 'Change Name'}
                    aria-label="Change Name"
                  >
                    <Edit2 size={15} />
                  </button>
                )}
              </div>
            ) : (
              /* Inline name edit form */
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center justify-center gap-2 my-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  className="px-3 py-1.5 rounded-xl bg-[#21103D] border border-[#FFD36A]/60 text-sm text-[#FFF0C2] font-cormorant font-bold focus:outline-none focus:ring-1 focus:ring-[#FFD36A] w-48 text-center"
                  maxLength={40}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFD36A] to-[#FF8A24] text-[#090719] font-cinzel font-bold text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                >
                  <Save size={13} /> {language === 'hi' ? 'सहेजें' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-2.5 py-1.5 rounded-xl border border-[#FFD36A]/30 text-[#FFF0C2]/70 text-xs font-outfit hover:bg-[#FFD36A]/10"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </form>
            )}

            {nameSavedSuccess && (
              <span className="text-xs text-emerald-400 font-medium mb-2">
                ✓ {language === 'hi' ? 'नाम सफलतापूर्वक सहेजा गया!' : 'Name updated on your wish card!'}
              </span>
            )}

            {/* Special dynamic indicator if arrived via an invitation link */}
            {isInvited && !showMyOwnCard && (
              <div className="mb-3 px-3 py-1 rounded-full bg-[#FFD36A]/10 border border-[#FFD36A]/30 text-[11px] sm:text-xs text-[#FFF0C2]/90 flex items-center gap-1.5">
                <span>🪔</span>
                <span>
                  {language === 'hi'
                    ? `यह पावन शुभकामना संदेश आपको ${inviterName} की ओर से मिला है`
                    : `This heartfelt wish was shared especially with you by ${inviterName}`}
                </span>
              </div>
            )}

            {/* Floral Motif Footer (Exact match to screenshot 🌸 ✦ 🌸) */}
            <div className="flex items-center gap-2 text-base text-[#FFF0C2] opacity-90">
              <span>🌸</span>
              <span className="text-xs text-[#FFD36A]">✦</span>
              <span>🌸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle between Inviter's card and creating your own wish */}
      {isInvited && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowMyOwnCard(!showMyOwnCard)}
            className="px-4 py-2 rounded-full bg-[#090719]/80 border border-[#FFD36A]/40 text-xs font-cinzel text-[#FFD36A] hover:bg-[#FFD36A]/10 transition-all flex items-center gap-2 shadow-md"
          >
            <span>{showMyOwnCard ? '←' : '✨'}</span>
            <span>
              {showMyOwnCard
                ? (language === 'hi' ? `${inviterName} का कार्ड देखें` : `View ${inviterName}'s card`)
                : (language === 'hi' ? 'अपने नाम से दीवाली शुभकामना कार्ड बनाएं' : 'Create a wish card with YOUR name')}
            </span>
          </button>
        </div>
      )}

      {/* Interactive Action Buttons below greeting card */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-2xl">
        <button
          onClick={handleWhatsAppShare}
          className="w-full sm:w-auto px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-cinzel font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105"
          aria-label="Share on WhatsApp"
        >
          <Send size={15} />
          <span>{language === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}</span>
        </button>

        <button
          onClick={handleShareWishes}
          className="btn-royal-gold w-full sm:w-auto text-xs sm:text-sm flex items-center justify-center gap-2"
          aria-label={t('shareWishesBtn')}
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          <span>{copied ? t('copied') : t('shareWishesBtn')}</span>
        </button>

        <button
          onClick={handleReplayAnimation}
          className="btn-royal-secondary w-full sm:w-auto text-xs sm:text-sm flex items-center justify-center gap-2"
          aria-label={t('replayCelebrationBtn')}
        >
          <RotateCcw size={16} />
          <span>{t('replayCelebrationBtn')}</span>
        </button>

        <button
          onClick={onProceedToReferrals}
          className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#4A1028] hover:bg-[#5f1533] border border-[#FFD36A]/50 text-xs sm:text-sm font-cinzel font-bold text-[#FFD36A] flex items-center justify-center gap-2 transition-all shadow-md"
          aria-label={t('exploreReferralBtn')}
        >
          <span>{t('exploreReferralBtn')}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
